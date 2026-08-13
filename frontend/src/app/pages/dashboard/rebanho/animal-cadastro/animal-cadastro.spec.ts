import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnimalCadastro } from './animal-cadastro';
import { ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';

describe('AnimalCadastro', () => {
  let component: AnimalCadastro;
  let fixture: ComponentFixture<AnimalCadastro>;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [AnimalCadastro, ReactiveFormsModule],
      providers: [
        { provide: Router, useValue: routerSpy }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AnimalCadastro);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('formulário deve ser inválido quando vazio', () => {
    expect(component.animalForm.valid).toBeFalsy();
  });

  it('deve barrar submissão se formulário for inválido', () => {
    component.onSubmit();
    expect(component.isSubmitting).toBeFalse();
    expect(component.errorMessage).toContain('obrigatórios');
  });

  it('deve preencher o formulário corretamente e ser válido', () => {
    component.animalForm.controls['codigoIdentificacao'].setValue('BR-001');
    component.animalForm.controls['especie'].setValue('Bovino');
    component.animalForm.controls['raca'].setValue('Nelore');
    component.animalForm.controls['sexo'].setValue('Macho');
    component.animalForm.controls['dataNascimentoOuIdade'].setValue('2 Anos');
    component.animalForm.controls['peso'].setValue(450);
    component.animalForm.controls['condicaoSaude'].setValue('Saudável');

    expect(component.animalForm.valid).toBeTruthy();
  });
});
