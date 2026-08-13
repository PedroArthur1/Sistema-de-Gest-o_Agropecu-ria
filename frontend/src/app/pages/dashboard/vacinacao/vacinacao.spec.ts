import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { ActivatedRoute } from '@angular/router';
import { VacinacaoPage } from './vacinacao';
import { AnimalService } from '../../../services/animal/animal.service';
import { VacinacaoService } from '../../../services/vacinacao/vacinacao.service';
import { Animal } from '../../../models/animal.model';

describe('VacinacaoPage', () => {
  let component: VacinacaoPage;
  let fixture: ComponentFixture<VacinacaoPage>;
  let animalService: { listarAnimais: ReturnType<typeof vi.fn> };
  let vacinacaoService: { registrar: ReturnType<typeof vi.fn>; listarHistorico: ReturnType<typeof vi.fn> };

  const animais: Animal[] = [
    {
      id: 10,
      codigoIdentificacao: 'BOV-001',
      especie: 'Bovino',
      raca: 'Nelore',
      sexo: 'Macho',
      dataNascimentoOuIdade: '2023-01-15',
      peso: 450,
      condicaoSaude: 'Saudável'
    }
  ];

  beforeEach(async () => {
    animalService = {
      listarAnimais: vi.fn().mockReturnValue(of(animais))
    };
    vacinacaoService = {
      registrar: vi.fn().mockReturnValue(of({})),
      listarHistorico: vi.fn().mockReturnValue(of([]))
    };

    await TestBed.configureTestingModule({
      imports: [VacinacaoPage],
      providers: [
        { provide: AnimalService, useValue: animalService },
        { provide: VacinacaoService, useValue: vacinacaoService },
        { provide: ActivatedRoute, useValue: { params: of({}) } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(VacinacaoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('formulário deve ser inválido quando vazio', () => {
    expect(component.vacinacaoForm.valid).toBeFalsy();
  });

  it('deve barrar submissão se formulário for inválido', () => {
    component.onSubmit();
    expect(component.isSubmitting).toBe(false);
    expect(component.errorMessage).toContain('obrigatórios');
    expect(vacinacaoService.registrar).not.toHaveBeenCalled();
  });

  it('deve exigir vínculo com animal cadastrado e demais campos obrigatórios', () => {
    component.vacinacaoForm.patchValue({
      animalId: 10,
      nomeVacina: 'Febre Aftosa',
      dataAplicacao: '2026-08-12',
      dose: '5 mL',
      responsavel: 'Dr. João Veterinário',
      dataProximaDose: '2026-11-12'
    });

    expect(component.vacinacaoForm.valid).toBeTruthy();
  });

  it('deve consultar o histórico ao selecionar um animal', () => {
    component.vacinacaoForm.get('animalId')?.setValue(10);
    expect(vacinacaoService.listarHistorico).toHaveBeenCalledWith(10);
  });

  it('deve exibir o formulário de registro mesmo sem animais cadastrados', () => {
    animalService.listarAnimais.mockReturnValue(of([]));
    fixture = TestBed.createComponent(VacinacaoPage);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.vacinacaoForm).toBeTruthy();
    const formulario = fixture.nativeElement.querySelector('form');
    expect(formulario).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.card-titulo').textContent).toContain('Registrar vacinação');
  });
});
