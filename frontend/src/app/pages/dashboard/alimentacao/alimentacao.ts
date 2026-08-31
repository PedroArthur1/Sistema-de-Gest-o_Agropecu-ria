import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AlimentacaoService, Alimentacao } from '../../../services/alimentacao/alimentacao.service';
import { AnimalService } from '../../../services/animal/animal.service';
import { Animal } from '../../../models/animal.model';
import { TipoAlimentoService } from '../../../services/alimentacao/tipo-alimento.service';
import { TipoAlimento } from '../../../models/tipo-alimento.model';
import { GrupoRebanhoService } from '../../../services/rebanho/grupo-rebanho.service';
import { GrupoRebanho } from '../../../models/grupo-rebanho.model';

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
    FormsModule,
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
  lotes: GrupoRebanho[] = [];
  mensagemSucesso: string = '';
  mensagemErro: string = '';
  isSubmitting: boolean = false;
  abaAtiva: 'fornecimento' | 'tipos' = 'fornecimento';
  tipoSelecao: 'animais' | 'lotes' = 'animais';

  constructor(
    private fb: FormBuilder,
    private alimentacaoService: AlimentacaoService,
    private animalService: AnimalService,
    private tipoAlimentoService: TipoAlimentoService,
    private grupoRebanhoService: GrupoRebanhoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.alimentacaoForm = this.fb.group({
      animalIds: [[]],
      grupoId: [null],
      tipoAlimentoId: ['', Validators.required],
      quantidade: ['', Validators.required],
      data: ['', Validators.required],
      observacoes: ['']
    });

    this.carregarAnimais();
    this.carregarLotes();
    this.carregarHistorico();
    this.carregarTiposAlimento();
  }

  carregarTiposAlimento(): void {
    this.tipoAlimentoService.listarTiposAlimento().subscribe({
      next: (dados) => {
        this.tiposAlimento = dados;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao carregar tipos de alimento', err);
        this.cdr.detectChanges();
      }
    });
  }

  carregarLotes(): void {
    this.grupoRebanhoService.listarGrupos().subscribe({
      next: (dados) => {
        this.lotes = dados;
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erro ao carregar lotes', err)
    });
  }

  carregarAnimais(): void {
    this.animalService.listarAnimais().subscribe({
      next: (dados: Animal[]) => {
        this.animais = dados;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Erro ao buscar lista de animais', err);
        if (err.status !== 401) {
          this.mensagemErro = 'Erro ao carregar a lista de animais.';
        }
        this.cdr.detectChanges();
      }
    });
  }

  carregarHistorico(): void {
    this.alimentacaoService.listarTodas().subscribe({
      next: (dados: Alimentacao[]) => {
        this.historico = dados;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.error('Erro ao carregar histórico geral', err);
        if (err.status !== 401) {
          this.mensagemErro = err.error?.error || err.error?.message || 'Erro ao carregar histórico de alimentação.';
        }
        this.cdr.detectChanges();
      }
    });
  }

  campoInvalido(campo: string): boolean {
    const control = this.alimentacaoForm.get(campo);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit(): void {
    const isAnimais = this.tipoSelecao === 'animais';
    const hasAnimalIds = this.alimentacaoForm.value.animalIds?.length > 0;
    const hasGrupoId = !!this.alimentacaoForm.value.grupoId;

    if (isAnimais && !hasAnimalIds) {
      this.mensagemErro = 'Selecione pelo menos um animal.';
      return;
    }
    if (!isAnimais && !hasGrupoId) {
      this.mensagemErro = 'Selecione um lote.';
      return;
    }

    if (this.alimentacaoForm.valid) {
      this.isSubmitting = true;
      this.mensagemErro = '';
      
      const payload = { ...this.alimentacaoForm.value };
      if (isAnimais) {
        payload.grupoId = null;
      } else {
        payload.animalIds = [];
      }

      this.alimentacaoService.registrarAlimentacao(payload).subscribe({
        next: (res: Alimentacao) => {
          this.historico.unshift(res);
          this.alimentacaoForm.patchValue({ animalIds: [], grupoId: null });
          this.mensagemSucesso = 'Alimentação registrada com sucesso!';
          this.isSubmitting = false;
          this.cdr.detectChanges();
          setTimeout(() => {
            this.mensagemSucesso = '';
            this.cdr.detectChanges();
          }, 3000);
        },
        error: (err: any) => {
          console.error('Erro ao salvar alimentação', err);
          this.mensagemErro = err.error?.error || err.error?.message || 'Erro ao registrar alimentação.';
          this.isSubmitting = false;
          this.cdr.detectChanges();
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
