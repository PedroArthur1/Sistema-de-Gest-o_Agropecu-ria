import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AlimentacaoComponent } from './alimentacao';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ActivatedRoute } from '@angular/router';

describe('AlimentacaoComponent', () => {
  let component: AlimentacaoComponent;
  let fixture: ComponentFixture<AlimentacaoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlimentacaoComponent, HttpClientTestingModule],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: { get: () => '1' } } 
          }
        }
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AlimentacaoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
