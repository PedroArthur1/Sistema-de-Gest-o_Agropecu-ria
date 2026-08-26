import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Welcome } from './welcome';
import { AuthService } from '../../../services/auth/auth.service';
import { AnimalService } from '../../../services/animal/animal.service';
import { NotificacaoService } from '../../../services/notificacao/notificacao.service';
import { of, BehaviorSubject } from 'rxjs';
import { Animal } from '../../../models/animal.model';
import { vi } from 'vitest';

describe('Welcome', () => {
  let component: Welcome;
  let fixture: ComponentFixture<Welcome>;
  
  let mockAuthService: any;
  let mockAnimalService: any;
  let mockNotificacaoService: any;
  let mockEstadoSubject: BehaviorSubject<any>;

  beforeEach(async () => {
    mockAuthService = {
      getRole: vi.fn().mockReturnValue('ROLE_USER'),
      getUserName: vi.fn().mockReturnValue('Test User')
    };

    mockAnimalService = {
      listarAnimais: vi.fn().mockReturnValue(of([
        { id: 1 } as Animal, 
        { id: 2 } as Animal, 
        { id: 3 } as Animal
      ]))
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
    expect(component.totalAnimais).toBe(3);
  });

  it('deve atualizar vacinasAtrasadas ouvindo o estado do NotificacaoService', () => {
    expect(component.vacinasAtrasadas).toBe(2);
    
    // Emitindo novo estado
    mockEstadoSubject.next({ totalAtrasadas: 5, totalProximas: 0 });
    fixture.detectChanges();
    
    expect(component.vacinasAtrasadas).toBe(5);
  });
});
