import { TestBed } from '@angular/core/testing';
import { NotificacaoService } from './notificacao.service';
import { LembreteVacinacaoService } from '../vacinacao/lembrete-vacinacao.service';
import { of } from 'rxjs';
import { Lembrete } from '../../models/lembrete.model';

describe('NotificacaoService', () => {
  let service: NotificacaoService;
  let lembreteServiceSpy: jasmine.SpyObj<LembreteVacinacaoService>;

  beforeEach(() => {
    const spy = jasmine.createSpyObj('LembreteVacinacaoService', ['getLembretes']);
    
    TestBed.configureTestingModule({
      providers: [
        NotificacaoService,
        { provide: LembreteVacinacaoService, useValue: spy }
      ]
    });

    lembreteServiceSpy = TestBed.inject(LembreteVacinacaoService) as jasmine.SpyObj<LembreteVacinacaoService>;
  });

  it('deve calcular corretamente os totais de vacinas atrasadas e proximas', (done) => {
    const mockLembretes: Lembrete[] = [
      { animalId: 1, codigoAnimal: 'A1', nomeAnimal: 'Test', vacina: 'V1', dataPrevista: '2023-01-01', status: 'Atrasada' },
      { animalId: 2, codigoAnimal: 'A2', nomeAnimal: 'Test', vacina: 'V2', dataPrevista: '2023-01-01', status: 'Hoje' },
      { animalId: 3, codigoAnimal: 'A3', nomeAnimal: 'Test', vacina: 'V3', dataPrevista: '2023-01-01', status: 'Próxima' }
    ];

    lembreteServiceSpy.getLembretes.and.returnValue(of(mockLembretes));
    
    // O construtor chamará atualizarNotificacoes
    service = TestBed.inject(NotificacaoService);

    service.estado$.subscribe(estado => {
      expect(estado.totalAtrasadas).toBe(1);
      expect(estado.totalHoje).toBe(1);
      expect(estado.totalProximas).toBe(1);
      expect(estado.totalGeralAtivas).toBe(2);
      done();
    });
  });
});
