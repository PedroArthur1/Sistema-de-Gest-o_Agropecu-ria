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
import { TipoAlimentoComponent } from '../tipo-alimento/tipo-alimento';

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
    AlertaMensagemComponent,
    TipoAlimentoComponent
  ],
  templateUrl: './alimentacao.html',
  styleUrls: ['./alimentacao.css']
})
export class AlimentacaoComponent implements OnInit {
  alimentacaoForm!: FormGroup;
  historico: Alimentacao[] = [];
  animais: Animal[] = [];
  tiposAlimento: TipoAlimento[] = [];
  mensagemSucesso: string = '';
  mensagemErro: string = '';
  isSubmitting: boolean = false;
  abaAtiva: 'fornecimento' | 'tipos' = 'fornecimento';

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

  trocarAba(aba: 'fornecimento' | 'tipos') {
    this.abaAtiva = aba;
    if (aba === 'fornecimento') {
      // recarrega os tipos de alimento caso tenham sido criados novos
      this.carregarTiposAlimento();
    }
  }
}
