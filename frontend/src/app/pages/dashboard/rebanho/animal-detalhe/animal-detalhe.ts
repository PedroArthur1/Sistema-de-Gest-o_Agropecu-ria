import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { AnimalService } from '../../../../services/animal/animal.service';
import { VacinacaoService } from '../../../../services/vacinacao/vacinacao.service';
import { Animal } from '../../../../models/animal.model';
import { Vacinacao } from '../../../../models/vacinacao.model';
import { CabecalhoPaginaComponent } from '../../../../components/cabecalho-pagina/cabecalho-pagina.component';
import { AlertaMensagemComponent } from '../../../../components/alerta-mensagem/alerta-mensagem.component';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TratamentoService, Tratamento } from '../../../../services/tratamento/tratamento.service';
@Component({
  selector: 'app-animal-detalhe',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    CabecalhoPaginaComponent,
    AlertaMensagemComponent,
    ReactiveFormsModule
  ],
  templateUrl: './animal-detalhe.html',
  styleUrl: './animal-detalhe.css'
})
export class AnimalDetalhe implements OnInit {
  animal: Animal | null = null;
  historico: Vacinacao[] = [];
  proximasDoses: Vacinacao[] = [];
  carregando = true;
  errorMessage = '';
  tratamentoForm!: FormGroup;
  historicoTratamentos: Tratamento[] = [];
  mensagemSucessoTratamento: string = '';

  constructor(
    private route: ActivatedRoute,
    private animalService: AnimalService,
    private vacinacaoService: VacinacaoService,
    private cdr: ChangeDetectorRef,
    private fb: FormBuilder,
    private tratamentoService: TratamentoService,

  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      const id = Number(idParam);

      if (!idParam || isNaN(id) || id <= 0) {
        this.errorMessage = 'Identificador do animal inválido.';
        this.carregando = false;
        this.cdr.detectChanges();
        return;
      }

      this.carregarDados(id);
    });
    this.tratamentoForm = this.fb.group({
      medicamento: ['', Validators.required],
      data: ['', Validators.required],
      motivo: ['', Validators.required],
      dosagem: [''],
      observacoes: ['']
    });
    this.carregarTratamentos();
  }

  carregarDados(animalId: number): void {
    this.carregando = true;
    this.errorMessage = '';
    this.animal = null;
    this.historico = [];
    this.proximasDoses = [];

    forkJoin({
      animal: this.animalService.buscarAnimalPorId(animalId),
      historico: this.vacinacaoService.listarHistorico(animalId).pipe(catchError(() => of([]))),
      proximas: this.vacinacaoService.listarProximasDoses(animalId).pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ animal, historico, proximas }) => {
        this.animal = animal;
        this.historico = historico ?? [];
        this.proximasDoses = proximas ?? [];
        this.carregando = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.carregando = false;
        if (err.status === 404) {
          this.errorMessage = 'Animal não encontrado ou você não tem permissão para acessá-lo.';
        } else if (err.status === 401 || err.status === 403) {
          this.errorMessage = 'Sessão expirada ou não autenticada. Por favor, faça login novamente.';
        } else {
          this.errorMessage = 'Erro ao carregar informações do animal. Verifique a conexão com o backend.';
        }
        this.cdr.detectChanges();
      }
    });
  }
  carregarTratamentos(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.tratamentoService.listarPorAnimal(id).subscribe({
      next: (dados: Tratamento[]) => this.historicoTratamentos = dados,
      error: (err: any) => console.error(err)
    });
  }

  registrarNovoTratamento(): void {
    if (this.tratamentoForm.valid) {
      const id = Number(this.route.snapshot.paramMap.get('id'));
      const novo: Tratamento = { animalId: id, ...this.tratamentoForm.value };

      this.tratamentoService.registrarTratamento(novo).subscribe({
        next: (res: Tratamento) => {
          this.historicoTratamentos.push(res);
          this.tratamentoForm.reset();
          this.mensagemSucessoTratamento = 'Tratamento salvo!';
          setTimeout(() => this.mensagemSucessoTratamento = '', 3000);
        }
      });
    }
  }
}

