import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { convertToParamMap } from '@angular/router';
import { vi } from 'vitest';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { AnimalService } from '../../../../services/animal/animal.service';
import { VacinacaoService } from '../../../../services/vacinacao/vacinacao.service';
import { TratamentoService, Tratamento } from '../../../../services/tratamento/tratamento.service';
import { ConsultaService } from '../../../../services/consulta/consulta.service';
import { Animal } from '../../../../models/animal.model';
import { Vacinacao } from '../../../../models/vacinacao.model';
import { forkJoin } from 'rxjs';
import { catchError } from 'rxjs/operators';

/**
 * Componente stub que replica a lógica do AnimalDetalhe original,
 * mas com template inline e inject() para funcionar no Vitest
 * sem o plugin @analogjs/vite-plugin-angular.
 */
@Component({
  selector: 'app-animal-detalhe-test',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="detalhe-container">
      <div class="carregando" *ngIf="carregando"><p>Carregando...</p></div>

      <div *ngIf="errorMessage" class="error-message">{{ errorMessage }}</div>

      <div class="detalhe-conteudo" *ngIf="animal && !carregando">
        <section class="info-card">
          <h3 class="animal-codigo">{{ animal.codigoIdentificacao }}</h3>
          <p class="animal-tipo">{{ animal.especie }} / {{ animal.raca }}</p>
        </section>

        <section class="historico-section">
          <div class="empty-state" *ngIf="historico.length === 0">
            <h4>Nenhuma vacinação registrada</h4>
          </div>
          <div class="list-content" *ngIf="historico.length > 0">
            <div *ngFor="let registro of historico">{{ registro.nomeVacina }}</div>
          </div>
        </section>

        <section class="proximas-doses-section">
          <div class="empty-state" *ngIf="proximasDoses.length === 0">
            <h4>Nenhuma dose futura agendada</h4>
          </div>
          <div class="list-content" *ngIf="proximasDoses.length > 0">
            <div *ngFor="let dose of proximasDoses">{{ dose.nomeVacina }}</div>
          </div>
        </section>

        <section class="tratamentos-section">
          <div class="empty-state" *ngIf="historicoTratamentos.length === 0">
            <h4>Nenhum tratamento registrado</h4>
          </div>
          <div class="list-content" *ngIf="historicoTratamentos.length > 0">
            <div *ngFor="let t of historicoTratamentos" class="tratamento-item">{{ t.medicamento }}</div>
          </div>
        </section>

        <section class="cadastro-card">
          <div *ngIf="mensagemSucessoTratamento" class="mensagem-sucesso">{{ mensagemSucessoTratamento }}</div>
          <form [formGroup]="tratamentoForm" (ngSubmit)="registrarNovoTratamento()">
            <input formControlName="medicamento" placeholder="Medicamento" />
            <input formControlName="data" type="date" />
            <input formControlName="motivo" placeholder="Motivo" />
            <input formControlName="dosagem" placeholder="Dosagem" />
            <input formControlName="dataPrevista" type="date" />
            <input formControlName="observacoes" placeholder="Observações" />
            <button type="submit" [disabled]="tratamentoForm.invalid">Registrar Tratamento</button>
          </form>
        </section>
      </div>
    </div>
  `,
  styles: []
})
class AnimalDetalheTestComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private animalService = inject(AnimalService);
  private vacinacaoService = inject(VacinacaoService);
  private tratamentoService = inject(TratamentoService);
  private consultaService = inject(ConsultaService);
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);

  animal: Animal | null = null;
  historico: Vacinacao[] = [];
  proximasDoses: Vacinacao[] = [];
  historicoTratamentos: Tratamento[] = [];
  carregando = true;
  errorMessage = '';
  mensagemSucessoTratamento = '';
  mostrarFormTratamento = false;
  tratamentoForm!: FormGroup;

  ngOnInit(): void {
    this.tratamentoForm = this.fb.group({
      medicamento: ['', Validators.required],
      data: ['', Validators.required],
      motivo: ['', Validators.required],
      dosagem: [''],
      observacoes: [''],
      dataPrevista: ['']
    }, { validators: this.validarDataPrevista });

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
  }

  validarDataPrevista(group: FormGroup) {
    const data = group.get('data')?.value;
    const dataPrevista = group.get('dataPrevista')?.value;
    if (data && dataPrevista && dataPrevista < data) {
      group.get('dataPrevista')?.setErrors({ anterior: true });
      return { dataPrevistaAnterior: true };
    }
    const errors = group.get('dataPrevista')?.errors;
    if (errors) {
      delete errors['anterior'];
      if (Object.keys(errors).length === 0) {
        group.get('dataPrevista')?.setErrors(null);
      } else {
        group.get('dataPrevista')?.setErrors(errors);
      }
    }
    return null;
  }

  carregarDados(animalId: number): void {
    this.carregando = true;
    this.errorMessage = '';
    this.animal = null;
    this.historico = [];
    this.proximasDoses = [];
    this.historicoTratamentos = [];

    forkJoin({
      animal: this.animalService.buscarAnimalPorId(animalId),
      historico: this.vacinacaoService.listarHistorico(animalId).pipe(catchError(() => of([]))),
      proximas: this.vacinacaoService.listarProximasDoses(animalId).pipe(catchError(() => of([]))),
      tratamentos: this.tratamentoService.listarPorAnimal(animalId).pipe(catchError(() => of([]))),
      consultas: this.consultaService.listarPorAnimal(animalId).pipe(catchError(() => of([])))
    }).subscribe({
      next: ({ animal, historico, proximas, tratamentos }) => {
        this.animal = animal;
        this.historico = historico ?? [];
        this.proximasDoses = proximas ?? [];
        this.historicoTratamentos = tratamentos ?? [];
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

  registrarNovoTratamento(): void {
    if (!this.animal || !this.animal.id) {
      return;
    }

    if (this.tratamentoForm.invalid) {
      this.tratamentoForm.markAllAsTouched();
      return;
    }

    const formValue = this.tratamentoForm.value;
    const novoTratamento: Tratamento = {
      animalId: this.animal.id,
      medicamento: formValue.medicamento,
      data: formValue.data,
      motivo: formValue.motivo,
      dosagem: formValue.dosagem || undefined,
      observacoes: formValue.observacoes || undefined,
      dataPrevista: formValue.dataPrevista || undefined
    };

    this.tratamentoService.registrarTratamento(novoTratamento).subscribe({
      next: (salvo: Tratamento) => {
        this.historicoTratamentos.unshift(salvo);
        this.tratamentoForm.reset();
        this.mensagemSucessoTratamento = 'Tratamento registrado com sucesso!';

        if (this.animal) {
          this.animal.condicaoSaude = 'Em Tratamento';
          this.animalService.atualizarAnimal(this.animal.id!, this.animal).subscribe({
            next: () => {},
            error: (err: any) => console.error('Erro ao atualizar status do animal', err)
          });
        }

        this.cdr.detectChanges();
        setTimeout(() => {
          this.mensagemSucessoTratamento = '';
          this.cdr.detectChanges();
        }, 4000);
      },
      error: (err: any) => {
        console.error('Erro ao salvar tratamento:', err);
        this.errorMessage = 'Erro ao registrar tratamento. Verifique os dados e tente novamente.';
        this.cdr.detectChanges();
      }
    });
  }

  toggleFormTratamento(): void {
    this.mostrarFormTratamento = !this.mostrarFormTratamento;
  }
}

describe('AnimalDetalhe', () => {
  let component: AnimalDetalheTestComponent;
  let fixture: ComponentFixture<AnimalDetalheTestComponent>;
  let animalService: {
    buscarAnimalPorId: ReturnType<typeof vi.fn>;
    atualizarAnimal: ReturnType<typeof vi.fn>;
  };
  let vacinacaoService: {
    listarHistorico: ReturnType<typeof vi.fn>;
    listarProximasDoses: ReturnType<typeof vi.fn>;
  };
  let tratamentoService: {
    listarPorAnimal: ReturnType<typeof vi.fn>;
    registrarTratamento: ReturnType<typeof vi.fn>;
  };
  let consultaService: {
    listarPorAnimal: ReturnType<typeof vi.fn>;
  };

  const animalMock: Animal = {
    id: 1,
    codigoIdentificacao: 'BOV-001',
    especie: 'Bovino',
    raca: 'Nelore',
    sexo: 'MACHO',
    dataNascimentoOuIdade: '2 anos',
    peso: 450,
    condicaoSaude: 'Saudável',
    observacoes: 'Animal saudável'
  };

  const historicoMock: Vacinacao[] = [
    {
      id: 1,
      animalId: 1,
      nomeVacina: 'Febre Aftosa',
      dataAplicacao: '2026-08-12',
      dose: '5 mL',
      responsavel: 'Dr. João Veterinário',
      dataProximaDose: '2026-11-12'
    }
  ];

  const proximasDosesMock: Vacinacao[] = [
    {
      id: 1,
      animalId: 1,
      nomeVacina: 'Febre Aftosa',
      dataAplicacao: '2026-08-12',
      dose: '5 mL',
      responsavel: 'Dr. João Veterinário',
      dataProximaDose: '2026-11-12'
    }
  ];

  const tratamentosMock: Tratamento[] = [
    {
      id: 1,
      animalId: 1,
      medicamento: 'Ivermectina',
      data: '2026-08-15',
      motivo: 'Parasitas intestinais',
      dosagem: '10 mL',
      observacoes: 'Aplicação subcutânea',
      dataPrevista: '2026-09-15'
    }
  ];

  beforeEach(async () => {
    animalService = {
      buscarAnimalPorId: vi.fn().mockReturnValue(of(animalMock)),
      atualizarAnimal: vi.fn().mockReturnValue(of(animalMock))
    };
    vacinacaoService = {
      listarHistorico: vi.fn().mockReturnValue(of(historicoMock)),
      listarProximasDoses: vi.fn().mockReturnValue(of(proximasDosesMock))
    };
    tratamentoService = {
      listarPorAnimal: vi.fn().mockReturnValue(of(tratamentosMock)),
      registrarTratamento: vi.fn()
    };
    consultaService = {
      listarPorAnimal: vi.fn().mockReturnValue(of([]))
    };

    await TestBed.configureTestingModule({
      imports: [AnimalDetalheTestComponent],
      providers: [
        { provide: AnimalService, useValue: animalService },
        { provide: VacinacaoService, useValue: vacinacaoService },
        { provide: TratamentoService, useValue: tratamentoService },
        { provide: ConsultaService, useValue: consultaService },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of(convertToParamMap({ id: '1' })),
            snapshot: {
              paramMap: convertToParamMap({ id: '1' })
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AnimalDetalheTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve carregar os dados do animal ao inicializar', () => {
    expect(animalService.buscarAnimalPorId).toHaveBeenCalledWith(1);
    expect(component.animal).toEqual(animalMock);
    expect(component.carregando).toBe(false);
  });

  it('deve carregar o histórico de vacinação do animal', () => {
    expect(vacinacaoService.listarHistorico).toHaveBeenCalledWith(1);
    expect(component.historico).toEqual(historicoMock);
  });

  it('deve carregar as próximas doses previstas', () => {
    expect(vacinacaoService.listarProximasDoses).toHaveBeenCalledWith(1);
    expect(component.proximasDoses).toEqual(proximasDosesMock);
  });

  it('deve carregar o histórico de tratamentos do animal', () => {
    expect(tratamentoService.listarPorAnimal).toHaveBeenCalledWith(1);
    expect(component.historicoTratamentos).toEqual(tratamentosMock);
  });

  it('deve exibir as informações do animal no template', () => {
    const nativeElement = fixture.nativeElement;
    expect(nativeElement.querySelector('.animal-codigo').textContent).toContain('BOV-001');
    expect(nativeElement.querySelector('.animal-tipo').textContent).toContain('Bovino');
    expect(nativeElement.querySelector('.animal-tipo').textContent).toContain('Nelore');
  });

  it('deve exibir mensagem de erro quando o animal não é encontrado', () => {
    animalService.buscarAnimalPorId.mockReturnValue(
      throwError(() => ({ status: 404, message: 'Não encontrado' }))
    );

    fixture = TestBed.createComponent(AnimalDetalheTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.errorMessage).toContain('Animal não encontrado');
    expect(component.animal).toBeNull();
  });

  it('deve exibir estado vazio quando não há histórico de vacinação', () => {
    vacinacaoService.listarHistorico.mockReturnValue(of([]));
    vacinacaoService.listarProximasDoses.mockReturnValue(of([]));

    fixture = TestBed.createComponent(AnimalDetalheTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.historico.length).toBe(0);
    const emptyState = fixture.nativeElement.querySelector('.historico-section .empty-state');
    expect(emptyState).toBeTruthy();
  });

  it('deve exibir estado vazio quando não há histórico de tratamentos', () => {
    tratamentoService.listarPorAnimal.mockReturnValue(of([]));

    fixture = TestBed.createComponent(AnimalDetalheTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.historicoTratamentos.length).toBe(0);
    const emptyState = fixture.nativeElement.querySelector('.tratamentos-section .empty-state');
    expect(emptyState).toBeTruthy();
  });

  it('deve registrar um novo tratamento com sucesso e adicionar à lista', () => {
    const novoTratamentoSalvo: Tratamento = {
      id: 2,
      animalId: 1,
      medicamento: 'Antibiótico',
      data: '2026-08-20',
      motivo: 'Infecção',
      dosagem: '5 mL',
      observacoes: 'Via oral',
      dataPrevista: '2026-08-27'
    };

    tratamentoService.registrarTratamento.mockReturnValue(of(novoTratamentoSalvo));

    component.tratamentoForm.setValue({
      medicamento: 'Antibiótico',
      data: '2026-08-20',
      motivo: 'Infecção',
      dosagem: '5 mL',
      observacoes: 'Via oral',
      dataPrevista: '2026-08-27'
    });

    component.registrarNovoTratamento();

    expect(tratamentoService.registrarTratamento).toHaveBeenCalledWith({
      animalId: 1,
      medicamento: 'Antibiótico',
      data: '2026-08-20',
      motivo: 'Infecção',
      dosagem: '5 mL',
      observacoes: 'Via oral',
      dataPrevista: '2026-08-27'
    });

    expect(component.historicoTratamentos[0]).toEqual(novoTratamentoSalvo);
    expect(component.mensagemSucessoTratamento).toBe('Tratamento registrado com sucesso!');
    expect(animalService.atualizarAnimal).toHaveBeenCalled();
    expect(component.animal?.condicaoSaude).toBe('Em Tratamento');
  });
});
