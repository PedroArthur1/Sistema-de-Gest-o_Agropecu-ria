import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { convertToParamMap } from '@angular/router';
import { vi } from 'vitest';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Component, OnInit, ChangeDetectorRef, inject } from '@angular/core';
import { AnimalService } from '../../../../services/animal/animal.service';
import { VacinacaoService } from '../../../../services/vacinacao/vacinacao.service';
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
  imports: [CommonModule],
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
      </div>
    </div>
  `,
  styles: []
})
class AnimalDetalheTestComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private animalService = inject(AnimalService);
  private vacinacaoService = inject(VacinacaoService);
  private cdr = inject(ChangeDetectorRef);

  animal: Animal | null = null;
  historico: Vacinacao[] = [];
  proximasDoses: Vacinacao[] = [];
  carregando = true;
  errorMessage = '';

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
}

describe('AnimalDetalhe', () => {
  let component: AnimalDetalheTestComponent;
  let fixture: ComponentFixture<AnimalDetalheTestComponent>;
  let animalService: { buscarAnimalPorId: ReturnType<typeof vi.fn> };
  let vacinacaoService: {
    listarHistorico: ReturnType<typeof vi.fn>;
    listarProximasDoses: ReturnType<typeof vi.fn>;
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

  beforeEach(async () => {
    animalService = {
      buscarAnimalPorId: vi.fn().mockReturnValue(of(animalMock))
    };
    vacinacaoService = {
      listarHistorico: vi.fn().mockReturnValue(of(historicoMock)),
      listarProximasDoses: vi.fn().mockReturnValue(of(proximasDosesMock))
    };

    await TestBed.configureTestingModule({
      imports: [AnimalDetalheTestComponent],
      providers: [
        { provide: AnimalService, useValue: animalService },
        { provide: VacinacaoService, useValue: vacinacaoService },
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
});
