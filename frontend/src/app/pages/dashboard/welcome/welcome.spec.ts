import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Welcome } from './welcome';
import { AuthService } from '../../../services/auth/auth.service';
import { AnimalService } from '../../../services/animal/animal.service';
import { NotificacaoService } from '../../../services/notificacao/notificacao.service';
import { of, BehaviorSubject } from 'rxjs';
import { Animal } from '../../../models/animal.model';
import { vi } from 'vitest';

const criarAnimais = (): Animal[] => [
  { id: 1, codigoIdentificacao: 'BOV-001', especie: 'Bovino', raca: 'Nelore', sexo: 'MACHO', dataNascimentoOuIdade: '2023-03-15', peso: 450, condicaoSaude: 'Saudável' },
  { id: 2, codigoIdentificacao: 'BOV-002', especie: 'Bovino', raca: 'Angus', sexo: 'FEMEA', dataNascimentoOuIdade: '2021-06-10', peso: 380, condicaoSaude: 'Saudável' },
  { id: 3, codigoIdentificacao: 'BOV-003', especie: 'Bovino', raca: 'Nelore', sexo: 'FEMEA', dataNascimentoOuIdade: '2024-11-20', peso: 200, condicaoSaude: 'Em tratamento' },
  { id: 4, codigoIdentificacao: 'EQU-001', especie: 'Equino', raca: 'Mangalarga', sexo: 'MACHO', dataNascimentoOuIdade: '2019-01-05', peso: 500, condicaoSaude: 'Saudável' },
  { id: 5, codigoIdentificacao: 'BOV-004', especie: 'Bovino', raca: 'Gir', sexo: 'FEMEA', dataNascimentoOuIdade: '2026-05-01', peso: 80, condicaoSaude: 'Saudável' },
];

describe('Welcome', () => {
  let component: Welcome;
  let fixture: ComponentFixture<Welcome>;

  let mockAuthService: any;
  let mockAnimalService: any;
  let mockNotificacaoService: any;
  let mockEstadoSubject: BehaviorSubject<any>;
  let animaisMock: Animal[];

  beforeEach(async () => {
    animaisMock = criarAnimais();

    mockAuthService = {
      getRole: vi.fn().mockReturnValue('ROLE_USER'),
      getUserName: vi.fn().mockReturnValue('Test User')
    };

    mockAnimalService = {
      listarAnimais: vi.fn().mockReturnValue(of(animaisMock))
    };

    mockEstadoSubject = new BehaviorSubject({ totalAtrasadas: 2, totalProximas: 1 });
    mockNotificacaoService = {
      estado$: mockEstadoSubject.asObservable()
    };

    await TestBed.configureTestingModule({
      imports: [Welcome],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: AnimalService, useValue: mockAnimalService },
        { provide: NotificacaoService, useValue: mockNotificacaoService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Welcome);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve inicializar role e userName do AuthService', () => {
    expect(component.role).toBe('ROLE_USER');
    expect(component.userName).toBe('Test User');
  });

  it('deve carregar o total de animais chamando AnimalService', () => {
    expect(mockAnimalService.listarAnimais).toHaveBeenCalled();
    expect(component.totalAnimais).toBe(5);
  });

  it('deve atualizar vacinasAtrasadas ouvindo o estado do NotificacaoService', () => {
    expect(component.vacinasAtrasadas).toBe(2);

    // Emitindo novo estado
    mockEstadoSubject.next({ totalAtrasadas: 5, totalProximas: 0 });
    fixture.detectChanges();

    expect(component.vacinasAtrasadas).toBe(5);
  });

  // --- Testes de Indicadores ---

  it('deve calcular o peso médio corretamente', () => {
    // (450 + 380 + 200 + 500 + 80) / 5 = 322
    expect(component.pesoMedio).toBeCloseTo(322, 0);
  });

  it('deve contar corretamente machos e fêmeas', () => {
    expect(component.totalMachos).toBe(2);
    expect(component.totalFemeas).toBe(3);
    expect(component.percentualMachos).toBe(40);
    expect(component.percentualFemeas).toBe(60);
  });

  it('deve agrupar corretamente por espécie', () => {
    expect(component.distribuicaoEspecie.length).toBe(2);

    const bovino = component.distribuicaoEspecie.find(d => d.nome === 'Bovino');
    const equino = component.distribuicaoEspecie.find(d => d.nome === 'Equino');

    expect(bovino).toBeTruthy();
    expect(bovino!.total).toBe(4);
    expect(bovino!.percentual).toBe(80);

    expect(equino).toBeTruthy();
    expect(equino!.total).toBe(1);
    expect(equino!.percentual).toBe(20);
  });

  it('deve agrupar corretamente por condição de saúde', () => {
    const saudavel = component.distribuicaoSaude.find(d => d.nome === 'Saudável');
    const emTratamento = component.distribuicaoSaude.find(d => d.nome === 'Em tratamento');

    expect(saudavel).toBeTruthy();
    expect(saudavel!.total).toBe(4);

    expect(emTratamento).toBeTruthy();
    expect(emTratamento!.total).toBe(1);
  });

  it('deve gerar distribuição de faixa etária', () => {
    expect(component.distribuicaoIdade.length).toBeGreaterThan(0);

    const totalDistribuido = component.distribuicaoIdade.reduce((acc, d) => acc + d.total, 0);
    expect(totalDistribuido).toBe(5);
  });

  it('deve marcar indicadores como carregados', () => {
    expect(component.indicadoresCarregados).toBe(true);
  });

  it('deve lidar com lista vazia de animais', () => {
    component.calcularIndicadores([]);
    expect(component.pesoMedio).toBe(0);
    expect(component.totalMachos).toBe(0);
    expect(component.totalFemeas).toBe(0);
    expect(component.distribuicaoEspecie.length).toBe(0);
    expect(component.distribuicaoRaca.length).toBe(0);
    expect(component.distribuicaoSaude.length).toBe(0);
    expect(component.distribuicaoIdade.length).toBe(0);
  });

  it('deve limitar raças a 6 + "Outras" quando houver mais de 6', () => {
    const muitasRacas: Animal[] = [];
    for (let i = 0; i < 10; i++) {
      muitasRacas.push({
        codigoIdentificacao: `BOV-${i}`,
        especie: 'Bovino',
        raca: `Raca${i}`,
        sexo: 'MACHO',
        dataNascimentoOuIdade: '2023-01-01',
        peso: 300,
        condicaoSaude: 'Saudável'
      });
    }
    component.calcularIndicadores(muitasRacas);
    // 6 raças + 1 "Outras" = 7
    expect(component.distribuicaoRaca.length).toBe(7);
    const outras = component.distribuicaoRaca.find(d => d.nome === 'Outras');
    expect(outras).toBeTruthy();
  });
});

