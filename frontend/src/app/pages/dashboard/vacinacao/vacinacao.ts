import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Animal } from '../../../models/animal.model';
import { Vacinacao } from '../../../models/vacinacao.model';
import { AnimalService } from '../../../services/animal/animal.service';
import { VacinacaoService } from '../../../services/vacinacao/vacinacao.service';
import { CabecalhoPaginaComponent } from '../../../components/cabecalho-pagina/cabecalho-pagina.component';
import { CampoFormularioComponent } from '../../../components/campo-formulario/campo-formulario.component';
import { BotaoAcaoComponent } from '../../../components/botao-acao/botao-acao.component';
import { AlertaMensagemComponent } from '../../../components/alerta-mensagem/alerta-mensagem.component';

@Component({
  selector: 'app-vacinacao',
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
  templateUrl: './vacinacao.html',
  styleUrl: './vacinacao.css'
})
export class VacinacaoPage implements OnInit {
  vacinacaoForm!: FormGroup;
  animais: Animal[] = [];
  historico: Vacinacao[] = [];
  carregandoAnimais = false;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private animalService: AnimalService,
    private vacinacaoService: VacinacaoService
  ) {}

  ngOnInit(): void {
    this.vacinacaoForm = this.fb.group({
      animalId: ['', Validators.required],
      nomeVacina: ['', Validators.required],
      dataAplicacao: ['', Validators.required],
      dose: ['', Validators.required],
      responsavel: ['', Validators.required],
      dataProximaDose: ['', Validators.required]
    }, { validators: VacinacaoPage.validarDatas });

    this.carregarAnimais();

    this.vacinacaoForm.get('animalId')?.valueChanges.subscribe((animalId) => {
      this.historico = [];
      if (animalId) {
        this.carregarHistorico(Number(animalId));
      }
    });
  }

  static validarDatas(group: AbstractControl): ValidationErrors | null {
    const aplicacao = group.get('dataAplicacao')?.value;
    const proxima = group.get('dataProximaDose')?.value;
    if (aplicacao && proxima && proxima < aplicacao) {
      return { dataProximaAnterior: true };
    }
    return null;
  }

  carregarAnimais(): void {
    this.carregandoAnimais = true;
    this.animalService.listarAnimais().subscribe({
      next: (dados) => {
        this.animais = dados ?? [];
        this.carregandoAnimais = false;
      },
      error: () => {
        this.carregandoAnimais = false;
        this.errorMessage = 'Não foi possível carregar os animais cadastrados.';
      }
    });
  }

  carregarHistorico(animalId: number): void {
    this.vacinacaoService.listarHistorico(animalId).subscribe({
      next: (dados) => {
        this.historico = dados;
      },
      error: () => {
        this.errorMessage = 'Não foi possível carregar o histórico de vacinação.';
      }
    });
  }

  campoInvalido(nome: string): boolean {
    const campo = this.vacinacaoForm.get(nome);
    return !!campo && campo.invalid && campo.touched;
  }

  get animalSelecionado(): Animal | undefined {
    const animalId = Number(this.vacinacaoForm.get('animalId')?.value);
    return this.animais.find((animal) => animal.id === animalId);
  }

  onSubmit(): void {
    this.successMessage = '';
    this.errorMessage = '';

    if (this.vacinacaoForm.invalid) {
      this.vacinacaoForm.markAllAsTouched();
      this.errorMessage = this.vacinacaoForm.hasError('dataProximaAnterior')
        ? 'Data prevista para a próxima dose não pode ser anterior à data da aplicação.'
        : 'Por favor, preencha todos os campos obrigatórios.';
      return;
    }

    const { animalId, ...dadosVacinacao } = this.vacinacaoForm.getRawValue();
    this.isSubmitting = true;

    this.vacinacaoService.registrar(Number(animalId), dadosVacinacao).subscribe({
      next: () => {
        this.successMessage = 'Vacinação registrada com sucesso!';
        this.isSubmitting = false;
        this.vacinacaoForm.patchValue({
          nomeVacina: '',
          dataAplicacao: '',
          dose: '',
          responsavel: '',
          dataProximaDose: ''
        });
        this.vacinacaoForm.markAsUntouched();
        this.carregarHistorico(Number(animalId));
      },
      error: (erro) => {
        this.isSubmitting = false;
        this.errorMessage = erro?.error?.message || 'Erro ao registrar vacinação. Tente novamente.';
      }
    });
  }
}
