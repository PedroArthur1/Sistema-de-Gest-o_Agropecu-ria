import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, convertToParamMap } from '@angular/router';
import { AnimalService } from '../../../../services/animal/animal.service';
import { Animal } from '../../../../models/animal.model';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

@Component({
  selector: 'app-animal-edicao-test',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="cadastro-container">
      <div class="alert alert-success" *ngIf="successMessage">{{ successMessage }}</div>
      <div class="alert alert-error" *ngIf="errorMessage">{{ errorMessage }}</div>
      <div class="carregando" *ngIf="isLoading"><p>Carregando...</p></div>

      <div class="cadastro-card" *ngIf="!isLoading && !errorMessage">
        <form [formGroup]="animalForm" (ngSubmit)="onSubmit()">
          <input type="text" formControlName="codigoIdentificacao" class="input-readonly" />
          <input type="text" formControlName="raca" />
          <input type="number" formControlName="peso" />
          <select formControlName="condicaoSaude">
            <option value="Saudável">Saudável</option>
            <option value="Em Tratamento">Em Tratamento</option>
          </select>
          <button type="submit">Salvar Alterações</button>
        </form>
      </div>
    </div>
  `
})
class AnimalEdicaoTestComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private animalService = inject(AnimalService);

  animalForm!: FormGroup;
  animalId: number | null = null;
  isLoading = true;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  ngOnInit(): void {
    this.animalForm = this.fb.group({
      codigoIdentificacao: [{ value: '', disabled: true }, Validators.required],
      especie: ['', Validators.required],
      raca: ['', Validators.required],
      sexo: ['', Validators.required],
      dataNascimentoOuIdade: ['', Validators.required],
      peso: ['', [Validators.required, Validators.min(0)]],
      condicaoSaude: ['', Validators.required],
      observacoes: ['']
    });

    const idParam = this.route.snapshot.paramMap.get('id');
    const id = Number(idParam);

    if (!idParam || isNaN(id) || id <= 0) {
      this.errorMessage = 'Identificador de animal inválido.';
      this.isLoading = false;
      return;
    }

    this.animalId = id;
    this.carregarAnimal(id);
  }

  carregarAnimal(id: number): void {
    this.isLoading = true;
    this.animalService.buscarAnimalPorId(id).subscribe({
      next: (animal: Animal) => {
        this.animalForm.patchValue({
          codigoIdentificacao: animal.codigoIdentificacao,
          especie: animal.especie,
          raca: animal.raca,
          sexo: animal.sexo,
          dataNascimentoOuIdade: animal.dataNascimentoOuIdade,
          peso: animal.peso,
          condicaoSaude: animal.condicaoSaude,
          observacoes: animal.observacoes || ''
        });
        this.isLoading = false;
      },
      error: (err: any) => {
        this.isLoading = false;
        if (err.status === 404) {
          this.errorMessage = 'Animal não encontrado ou você não possui permissão para acessá-lo.';
        } else {
          this.errorMessage = 'Erro ao carregar dados do animal.';
        }
      }
    });
  }

  onSubmit(): void {
    if (!this.animalId) return;

    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    if (this.animalForm.invalid) {
      this.animalForm.markAllAsTouched();
      this.errorMessage = 'Por favor, preencha todos os campos obrigatórios corretamente.';
      this.isSubmitting = false;
      return;
    }

    const rawValues = this.animalForm.getRawValue();
    const animalPayload: Animal = {
      id: this.animalId,
      codigoIdentificacao: rawValues.codigoIdentificacao,
      especie: rawValues.especie,
      raca: rawValues.raca,
      sexo: rawValues.sexo,
      dataNascimentoOuIdade: rawValues.dataNascimentoOuIdade,
      peso: Number(rawValues.peso),
      condicaoSaude: rawValues.condicaoSaude,
      observacoes: rawValues.observacoes ? rawValues.observacoes.trim() : undefined
    };

    this.animalService.atualizarAnimal(this.animalId, animalPayload).subscribe({
      next: () => {
        this.successMessage = 'Animal atualizado com sucesso!';
        this.isSubmitting = false;
      },
      error: (err: any) => {
        this.isSubmitting = false;
        this.errorMessage = 'Erro ao atualizar dados do animal. Tente novamente.';
      }
    });
  }
}

describe('AnimalEdicao', () => {
  let component: AnimalEdicaoTestComponent;
  let fixture: ComponentFixture<AnimalEdicaoTestComponent>;
  let mockRouter: any;
  let mockAnimalService: any;

  const mockAnimal: Animal = {
    id: 1,
    codigoIdentificacao: 'BOV-001',
    especie: 'Bovino',
    raca: 'Nelore',
    sexo: 'MACHO',
    dataNascimentoOuIdade: '2 anos',
    peso: 450,
    condicaoSaude: 'Saudável',
    observacoes: 'Nenhuma'
  };

  beforeEach(async () => {
    mockRouter = { navigate: vi.fn() };
    mockAnimalService = {
      buscarAnimalPorId: vi.fn().mockReturnValue(of(mockAnimal)),
      atualizarAnimal: vi.fn().mockReturnValue(of(mockAnimal))
    };

    await TestBed.configureTestingModule({
      imports: [AnimalEdicaoTestComponent],
      providers: [
        { provide: Router, useValue: mockRouter },
        { provide: AnimalService, useValue: mockAnimalService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ id: '1' })
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AnimalEdicaoTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('deve criar o componente', () => {
    expect(component).toBeTruthy();
  });

  it('deve carregar os dados do animal e preencher o formulário', () => {
    expect(mockAnimalService.buscarAnimalPorId).toHaveBeenCalledWith(1);
    expect(component.animalForm.getRawValue().codigoIdentificacao).toBe('BOV-001');
    expect(component.animalForm.get('raca')?.value).toBe('Nelore');
    expect(component.animalForm.get('peso')?.value).toBe(450);
  });

  it('deve manter o campo codigoIdentificacao desabilitado', () => {
    const control = component.animalForm.get('codigoIdentificacao');
    expect(control?.disabled).toBe(true);
  });

  it('deve submeter e chamar atualizarAnimal no serviço', () => {
    component.animalForm.patchValue({
      raca: 'Angus',
      peso: 500,
      condicaoSaude: 'Em Tratamento'
    });

    component.onSubmit();

    expect(mockAnimalService.atualizarAnimal).toHaveBeenCalledWith(1, expect.objectContaining({
      codigoIdentificacao: 'BOV-001',
      raca: 'Angus',
      peso: 500,
      condicaoSaude: 'Em Tratamento'
    }));
  });

  it('deve exibir mensagem de erro se a busca por ID falhar', () => {
    mockAnimalService.buscarAnimalPorId.mockReturnValue(
      throwError(() => ({ status: 404 }))
    );

    fixture = TestBed.createComponent(AnimalEdicaoTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.errorMessage).toContain('Animal não encontrado');
  });
});
