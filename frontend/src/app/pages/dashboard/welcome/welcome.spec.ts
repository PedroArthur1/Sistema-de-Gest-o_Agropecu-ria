import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Welcome } from './welcome';
import { AuthService } from '../../../services/auth/auth.service';
import { IndicadoresService } from '../../../services/indicadores/indicadores.service';
import { NotificacaoService } from '../../../services/notificacao/notificacao.service';
import { of, BehaviorSubject } from 'rxjs';
import { IndicadoresRebanho } from '../../../models/indicadores.model';
import { vi } from 'vitest';

const mockIndicadores: IndicadoresRebanho = {
  totalAnimais: 3,
  pesoMedio: 400.0,
  totalMachos: 2,
  totalFemeas: 1,
  percentualMachos: 67,
  percentualFemeas: 33,
  distribuicaoEspecie: [{ nome: 'Bovino', total: 3, percentual: 100 }],
  distribuicaoRaca:    [{ nome: 'Nelore', total: 2, percentual: 67 }],
  distribuicaoSaude:   [{ nome: 'Saudável', total: 3, percentual: 100 }],
  distribuicaoIdade:   [{ nome: 'Adulto (1-5 anos)', total: 3, percentual: 100 }]
};

describe('Welcome', () => {
  let component: Welcome;
  let fixture: ComponentFixture<Welcome>;

  let mockAuthService: any;
  let mockIndicadoresService: any;
  let mockNotificacaoService: any;
  let mockEstadoSubject: BehaviorSubject<any>;

  beforeEach(async () => {
    mockAuthService = {
      getRole: vi.fn().mockReturnValue('ROLE_USER'),
      getUserName: vi.fn().mockReturnValue('Test User')
    };

    mockIndicadoresService = {
      buscarIndicadores: vi.fn().mockReturnValue(of(mockIndicadores))
    };

    mockEstadoSubject = new BehaviorSubject({ totalAtrasadas: 2, totalProximas: 1 });
    mockNotificacaoService = {
      estado$: mockEstadoSubject.asObservable()
    };

    await TestBed.configureTestingModule({
      imports: [Welcome],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: IndicadoresService, useValue: mockIndicadoresService },
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

  it('deve carregar os indicadores chamando o IndicadoresService', () => {
    expect(mockIndicadoresService.buscarIndicadores).toHaveBeenCalled();
    expect(component.totalAnimais).toBe(3);
    expect(component.pesoMedio).toBe(400.0);
    expect(component.totalMachos).toBe(2);
    expect(component.totalFemeas).toBe(1);
    expect(component.percentualMachos).toBe(67);
    expect(component.percentualFemeas).toBe(33);
    expect(component.indicadoresCarregados).toBe(true);
  });

  it('deve aplicar cores às distribuicaoEspecie', () => {
    expect(component.distribuicaoEspecie.length).toBe(1);
    expect(component.distribuicaoEspecie[0].cor).toBeDefined();
    expect(component.distribuicaoEspecie[0].nome).toBe('Bovino');
  });

  it('deve atualizar vacinasAtrasadas ouvindo o estado do NotificacaoService', () => {
    expect(component.vacinasAtrasadas).toBe(2);

    mockEstadoSubject.next({ totalAtrasadas: 5, totalProximas: 0 });
    fixture.detectChanges();

    expect(component.vacinasAtrasadas).toBe(5);
  });

  it('deve marcar indicadoresCarregados=true mesmo em caso de erro', async () => {
    mockIndicadoresService.buscarIndicadores.mockReturnValue(
      new (await import('rxjs')).Observable(obs => obs.error(new Error('Network error')))
    );

    const fixture2 = TestBed.createComponent(Welcome);
    const component2 = fixture2.componentInstance;
    fixture2.detectChanges();

    expect(component2.indicadoresCarregados).toBe(true);
    expect(component2.totalAnimais).toBe(0);
  });
});
