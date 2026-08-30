import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TipoAlimentoComponent } from './tipo-alimento';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('TipoAlimentoComponent', () => {
  let component: TipoAlimentoComponent;
  let fixture: ComponentFixture<TipoAlimentoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TipoAlimentoComponent, HttpClientTestingModule]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TipoAlimentoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });
});
