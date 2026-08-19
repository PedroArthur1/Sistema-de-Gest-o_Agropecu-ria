import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { ActivatedRoute } from '@angular/router';
import { AnimalDetalhe } from './animal-detalhe';
import { AnimalService } from '../../../../services/animal/animal.service';
import { VacinacaoService } from '../../../../services/vacinacao/vacinacao.service';
import { Animal } from '../../../../models/animal.model';
import { Vacinacao } from '../../../../models/vacinacao.model';

describe('AnimalDetalhe', () => {
  let component: AnimalDetalhe;
  let fixture: ComponentFixture<AnimalDetalhe>;
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
      imports: [AnimalDetalhe],
      providers: [
        { provide: AnimalService, useValue: animalService },
        { provide: VacinacaoService, useValue: vacinacaoService },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: of({
              get: (key: string) => key === 'id' ? '1' : null
            }),
            snapshot: {
              paramMap: {
                get: (key: string) => key === 'id' ? '1' : null
              }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AnimalDetalhe);
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
    animalService.buscarAnimalPorId.mockReturnValue(throwError(() => ({ status: 404 })));

    fixture = TestBed.createComponent(AnimalDetalhe);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.errorMessage).toContain('Animal não encontrado');
    expect(component.animal).toBeNull();
  });

  it('deve exibir estado vazio quando não há histórico de vacinação', () => {
    vacinacaoService.listarHistorico.mockReturnValue(of([]));
    vacinacaoService.listarProximasDoses.mockReturnValue(of([]));

    fixture = TestBed.createComponent(AnimalDetalhe);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.historico.length).toBe(0);
    const emptyState = fixture.nativeElement.querySelector('.historico-section .empty-state');
    expect(emptyState).toBeTruthy();
  });
});
