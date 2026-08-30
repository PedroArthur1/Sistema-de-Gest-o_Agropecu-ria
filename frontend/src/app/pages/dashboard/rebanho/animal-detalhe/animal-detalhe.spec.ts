import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { convertToParamMap } from '@angular/router';
import { vi } from 'vitest';
import { ActivatedRoute } from '@angular/router';
import { AnimalDetalhe } from './animal-detalhe';
import { AnimalService } from '../../../../services/animal/animal.service';
import { VacinacaoService } from '../../../../services/vacinacao/vacinacao.service';
import { TratamentoService, Tratamento } from '../../../../services/tratamento/tratamento.service';
import { ConsultaService } from '../../../../services/consulta/consulta.service';
import { Animal } from '../../../../models/animal.model';
import { Vacinacao } from '../../../../models/vacinacao.model';

describe('AnimalDetalhe', () => {
  let component: AnimalDetalhe;
  let fixture: ComponentFixture<AnimalDetalhe>;
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
      imports: [AnimalDetalhe],
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

    fixture = TestBed.createComponent(AnimalDetalhe);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve alternar a visibilidade do formulario de tratamento', () => {
    expect(component.mostrarFormTratamento).toBe(false);
    component.toggleFormTratamento();
    expect(component.mostrarFormTratamento).toBe(true);
    component.toggleFormTratamento();
    expect(component.mostrarFormTratamento).toBe(false);
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

  it('deve exibir estado vazio quando não há histórico de tratamentos', () => {
    tratamentoService.listarPorAnimal.mockReturnValue(of([]));

    fixture = TestBed.createComponent(AnimalDetalhe);
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

    component.mostrarFormTratamento = true;
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
    expect(component.mostrarFormTratamento).toBe(false);
    expect(animalService.atualizarAnimal).toHaveBeenCalled();
    expect(component.animal?.condicaoSaude).toBe('Em Tratamento');
  });
});
