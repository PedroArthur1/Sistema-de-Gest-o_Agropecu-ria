import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LembretesVacinacaoComponent } from './lembretes-vacinacao.component';
import { LembreteVacinacaoService } from '../../../../services/vacinacao/lembrete-vacinacao.service';
import { of } from 'rxjs';
import { RouterModule } from '@angular/router';

describe('LembretesVacinacaoComponent', () => {
  let component: LembretesVacinacaoComponent;
  let fixture: ComponentFixture<LembretesVacinacaoComponent>;
  let lembreteServiceSpy: jasmine.SpyObj<LembreteVacinacaoService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('LembreteVacinacaoService', ['getLembretes']);
    spy.getLembretes.and.returnValue(of([]));

    await TestBed.configureTestingModule({
      imports: [LembretesVacinacaoComponent, RouterModule.forRoot([])],
      providers: [
        { provide: LembreteVacinacaoService, useValue: spy }
      ]
    })
    .compileComponents();
    
    lembreteServiceSpy = TestBed.inject(LembreteVacinacaoService) as jasmine.SpyObj<LembreteVacinacaoService>;
    fixture = TestBed.createComponent(LembretesVacinacaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve inicializar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve retornar a classe CSS de badge correta para cada status', () => {
    expect(component.getBadgeClass('Atrasada')).toBe('badge-atrasada');
    expect(component.getBadgeClass('Hoje')).toBe('badge-hoje');
    expect(component.getBadgeClass('Próxima')).toBe('badge-proxima');
  });
});
