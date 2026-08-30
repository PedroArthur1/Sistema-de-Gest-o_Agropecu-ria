import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AlimentacaoService, Alimentacao } from '../../../services/alimentacao/alimentacao.service';
import { AnimalService } from '../../../services/animal/animal.service';
import { Animal } from '../../../models/animal.model';
import { TipoAlimentoService } from '../../../services/alimentacao/tipo-alimento.service';
import { TipoAlimento } from '../../../models/tipo-alimento.model';

import { CabecalhoPaginaComponent } from '../../../components/cabecalho-pagina/cabecalho-pagina.component';
import { CampoFormularioComponent } from '../../../components/campo-formulario/campo-formulario.component';
import { BotaoAcaoComponent } from '../../../components/botao-acao/botao-acao.component';
import { AlertaMensagemComponent } from '../../../components/alerta-mensagem/alerta-mensagem.component';

@Component({
  selector: 'app-alimentacao',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    CabecalhoPaginaComponent,
    CampoFormularioComponent,
    BotaoAcaoComponent,
    AlertaMensagemComponent
  ],
  templateUrl: './alimentacao.html',
  styleUrls: ['./alimentacao.css']
})
export class AlimentacaoComponent implements OnInit {
  alimentacaoForm!: FormGroup;
  tipoAlimentoForm!: FormGroup;
  historico: Alimentacao[] = [];
  animais: Animal[] = [];
  tiposAlimento: TipoAlimento[] = [];
  exibirModalTipos: boolean = false;
  mensagemSucesso: string = '';
  mensagemErro: string = '';
  isSubmitting: boolean = false;

  constructor(
    private fb: FormBuilder,
    private alimentacaoService: AlimentacaoService,
    private animalService: AnimalService,
    private tipoAlimentoService: TipoAlimentoService
  ) {}

  ngOnInit(): void {
    this.alimentacaoForm = this.fb.group({
      animalIds: [[], Validators.required],
      tipoAlimentoId: ['', Validators.required],
      quantidade: ['', Validators.required],
      data: ['', Validators.required],
      observacoes: ['']
    });

    this.tipoAlimentoForm = this.fb.group({
      nome: ['', Validators.required],
      descricao: ['']
    });

    this.carregarAnimais();
    this.carregarHistorico();
    this.carregarTiposAlimento();
  }

  carregarTiposAlimento(): void {
    this.tipoAlimentoService.listarTiposAlimento().subscribe({
      next: (dados) => this.tiposAlimento = dados,
      error: (err) => console.error('Erro ao carregar tipos de alimento', err)
    });
  }

  carregarAnimais(): void {
    this.animalService.listarAnimais().subscribe({
      next: (dados: Animal[]) => this.animais = dados,
      error: (err: any) => {
        console.error('Erro ao buscar lista de animais', err);
        if (err.status !== 401) {
          this.mensagemErro = 'Erro ao carregar a lista de animais.';
        }
      }
    });
  }

  carregarHistorico(): void {
    this.alimentacaoService.listarTodas().subscribe({
      next: (dados: Alimentacao[]) => this.historico = dados,
      error: (err: any) => {
        console.error('Erro ao carregar histórico geral', err);
        if (err.status !== 401) {
          this.mensagemErro = 'Erro ao carregar histórico de alimentação.';
        }
      }
    });
  }

  campoInvalido(campo: string): boolean {
    const control = this.alimentacaoForm.get(campo);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit(): void {
    if (this.alimentacaoForm.valid) {
      this.isSubmitting = true;
      this.alimentacaoService.registrarAlimentacao(this.alimentacaoForm.value).subscribe({
        next: (res: Alimentacao) => {
          this.historico.unshift(res);
          this.alimentacaoForm.reset({ animalIds: [] });
          this.mensagemSucesso = 'Alimentação registrada no lote com sucesso!';
          this.isSubmitting = false;
          setTimeout(() => this.mensagemSucesso = '', 3000);
        },
        error: (err: any) => {
          console.error('Erro ao salvar alimentação', err);
          this.isSubmitting = false;
        }
      });
    } else {
      this.alimentacaoForm.markAllAsTouched();
    }
  }

  // --- Lógica Modal Tipos de Alimento ---
  abrirModalTipos(): void {
    this.exibirModalTipos = true;
    this.tipoAlimentoForm.reset();
  }

  fecharModalTipos(): void {
    this.exibirModalTipos = false;
  }

  salvarTipoAlimento(): void {
    if (this.tipoAlimentoForm.valid) {
      this.tipoAlimentoService.criarTipoAlimento(this.tipoAlimentoForm.value).subscribe({
        next: (novoTipo) => {
          this.tiposAlimento.push(novoTipo);
          this.tipoAlimentoForm.reset();
        },
        error: (err) => console.error('Erro ao salvar tipo de alimento', err)
      });
    }
  }

  excluirTipoAlimento(id: number): void {
    this.tipoAlimentoService.excluirTipoAlimento(id).subscribe({
      next: () => {
        this.tiposAlimento = this.tiposAlimento.filter(t => t.id !== id);
        // Limpar o select se o alimento deletado for o que estava selecionado
        if (this.alimentacaoForm.get('tipoAlimentoId')?.value == id) {
          this.alimentacaoForm.patchValue({ tipoAlimentoId: '' });
        }
      },
      error: (err) => {
        console.error('Erro ao deletar tipo de alimento', err);
        // Exibe um erro se tentar apagar alimento em uso
        alert('Não foi possível excluir. É provável que este alimento já esteja sendo usado no histórico.');
      }
    });
  }
}
