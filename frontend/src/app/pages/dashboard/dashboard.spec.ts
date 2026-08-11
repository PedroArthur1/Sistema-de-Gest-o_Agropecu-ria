import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { DashboardComponent } from './dashboard.component';
import { AnimalService } from '../../services/animal/animal.service';
import { of } from 'rxjs';

describe('DashboardComponent', () => {
  let componente: DashboardComponent;
  let ambienteTeste: ComponentFixture<DashboardComponent>;

  beforeEach(async () => {
    const servicoAnimalSpy = {
      listarAnimais: vi.fn().mockReturnValue(of([]))
    };

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AnimalService, useValue: servicoAnimalSpy }
      ]
    }).compileComponents();

    ambienteTeste = TestBed.createComponent(DashboardComponent);
    componente = ambienteTeste.componentInstance;
    await ambienteTeste.whenStable();
  });

  it('deve criar o componente do painel principal', () => {
    expect(componente).toBeTruthy();
  });
});
