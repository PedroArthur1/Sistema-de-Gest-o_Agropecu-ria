import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnimalCadastroComponent } from './animal-cadastro.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AnimalService } from '../../services/animal/animal.service';
import { of, throwError } from 'rxjs';

describe('AnimalCadastroComponent', () => {
  let componente: AnimalCadastroComponent;
  let ambienteTeste: ComponentFixture<AnimalCadastroComponent>;
  let servicoAnimalSpy: any;

  beforeEach(async () => {
    servicoAnimalSpy = {
      cadastrarAnimal: vi.fn(),
      listarAnimais: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [AnimalCadastroComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AnimalService, useValue: servicoAnimalSpy }
      ]
    }).compileComponents();

    ambienteTeste = TestBed.createComponent(AnimalCadastroComponent);
    componente = ambienteTeste.componentInstance;
    ambienteTeste.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(componente).toBeTruthy();
  });

  it('deve inicializar o formulário como inválido quando vazio', () => {
    expect(componente.formularioAnimal.valid).toBe(false);
  });

  it('deve validar o preenchimento de todos os campos obrigatórios', () => {
    const formulario = componente.formularioAnimal;
    expect(formulario.controls['codigoIdentificacao'].valid).toBe(false);
    expect(formulario.controls['especie'].valid).toBe(false);
    expect(formulario.controls['raca'].valid).toBe(false);
    expect(formulario.controls['sexo'].valid).toBe(false);
    expect(formulario.controls['dataNascimentoOuIdade'].valid).toBe(false);
    expect(formulario.controls['peso'].valid).toBe(false);
    expect(formulario.controls['condicaoSaude'].valid).toBe(false);

    formulario.patchValue({
      codigoIdentificacao: 'BOV-001',
      especie: 'Bovino',
      raca: 'Nelore',
      sexo: 'MACHO',
      dataNascimentoOuIdade: '2 anos',
      peso: 400,
      condicaoSaude: 'Excelente'
    });

    expect(formulario.valid).toBe(true);
  });

  it('não deve chamar o serviço de cadastro se o formulário for inválido', () => {
    componente.cadastrar();
    expect(servicoAnimalSpy.cadastrarAnimal).not.toHaveBeenCalled();
    expect(componente.mensagemErro).toContain('preencha todos os campos obrigatórios');
  });

  it('deve chamar o serviço de cadastro quando o formulário for válido', () => {
    const dadosAnimal = {
      codigoIdentificacao: 'BOV-001',
      especie: 'Bovino',
      raca: 'Nelore',
      sexo: 'MACHO',
      dataNascimentoOuIdade: '2023-01-01',
      peso: 350,
      condicaoSaude: 'Boa',
      observacoes: 'Sem observações'
    };

    componente.formularioAnimal.setValue(dadosAnimal);
    servicoAnimalSpy.cadastrarAnimal.mockReturnValue(of({ ...dadosAnimal, id: 1 }));

    componente.cadastrar();

    expect(servicoAnimalSpy.cadastrarAnimal).toHaveBeenCalledWith(dadosAnimal);
    expect(componente.mensagemSucesso).toContain("Animal 'BOV-001' cadastrado com sucesso!");
  });

  it('deve exibir mensagem de erro se a API retornar falha no cadastro', () => {
    componente.formularioAnimal.setValue({
      codigoIdentificacao: 'BOV-001',
      especie: 'Bovino',
      raca: 'Nelore',
      sexo: 'MACHO',
      dataNascimentoOuIdade: '2023-01-01',
      peso: 350,
      condicaoSaude: 'Boa',
      observacoes: ''
    });

    servicoAnimalSpy.cadastrarAnimal.mockReturnValue(
      throwError(() => ({ error: { message: 'Código de identificação já existe.' } }))
    );

    componente.cadastrar();

    expect(componente.mensagemErro).toBe('Código de identificação já existe.');
  });
});
