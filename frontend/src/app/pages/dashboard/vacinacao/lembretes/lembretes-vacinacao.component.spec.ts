import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LembretesVacinacaoComponent } from './lembretes-vacinacao.component';
import { LembreteVacinacaoService } from '../../../../services/vacinacao/lembrete-vacinacao.service';
import { of, throwError } from 'rxjs';
import { Lembrete } from '../../../../models/lembrete.model';
import { ActivatedRoute } from '@angular/router';
import { vi } from 'vitest';

describe('LembretesVacinacaoComponent', () => {
  let component: LembretesVacinacaoComponent;
  let fixture: ComponentFixture<LembretesVacinacaoComponent>;
  let mockLembreteService: any;

  beforeEach(async () => {
    mockLembreteService = {
      getLembretes: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [LembretesVacinacaoComponent],
      providers: [
        { provide: LembreteVacinacaoService, useValue: mockLembreteService },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: { get: () => '1' } } } }
      ]
    }).compileComponents();
  });

  it('should create', () => {
    mockLembreteService.getLembretes.mockReturnValue(of([]));
    fixture = TestBed.createComponent(LembretesVacinacaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('deve carregar a lista de lembretes no ngOnInit', () => {
    const lembretesMock: Lembrete[] = [
      { animalId: 1, codigoAnimal: 'BOV-01', nomeAnimal: 'Bovino', vacina: 'Aftosa', dataPrevista: '2026-08-30', status: 'Próxima', tipo: 'Vacina' }
    ];
    mockLembreteService.getLembretes.mockReturnValue(of(lembretesMock));
    
    fixture = TestBed.createComponent(LembretesVacinacaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(mockLembreteService.getLembretes).toHaveBeenCalled();
    expect(component.lembretes).toEqual(lembretesMock);
  });

  it('deve tratar erro ao carregar lembretes definindo a lista como vazia', () => {
    mockLembreteService.getLembretes.mockReturnValue(throwError(() => new Error('Server error')));
    
    fixture = TestBed.createComponent(LembretesVacinacaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.lembretes).toEqual([]);
  });

  it('deve retornar a classe correta do badge de status', () => {
    mockLembreteService.getLembretes.mockReturnValue(of([]));
    fixture = TestBed.createComponent(LembretesVacinacaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.getBadgeClass('Atrasada')).toBe('badge-atrasada');
    expect(component.getBadgeClass('Hoje')).toBe('badge-hoje');
    expect(component.getBadgeClass('Próxima')).toBe('badge-proxima');
    expect(component.getBadgeClass('QualquerOutro')).toBe('badge-proxima');
  });
});
