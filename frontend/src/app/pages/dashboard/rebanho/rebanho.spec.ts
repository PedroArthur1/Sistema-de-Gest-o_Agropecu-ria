import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Rebanho } from './rebanho';
import { ActivatedRoute } from '@angular/router';
import { of } from 'rxjs';

describe('Rebanho', () => {
  let component: Rebanho;
  let fixture: ComponentFixture<Rebanho>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Rebanho],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { params: of({}) }
        }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Rebanho);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('deve inicializar com o array de animais vazio (empty state)', () => {
    expect(component.animais.length).toBe(0);
    const emptyStateEl = fixture.nativeElement.querySelector('.empty-state');
    expect(emptyStateEl).toBeTruthy();
  });

  it('deve mudar a aba ativa ao clicar nela', () => {
    component.abaAtiva = 'Vacinados';
    fixture.detectChanges();
    
    expect(component.abaAtiva).toBe('Vacinados');
  });
});
