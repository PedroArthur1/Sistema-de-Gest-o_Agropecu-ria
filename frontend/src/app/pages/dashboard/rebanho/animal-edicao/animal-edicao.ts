import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AnimalService } from '../../../../services/animal/animal.service';
import { Animal } from '../../../../models/animal.model';

@Component({
  selector: 'app-animal-edicao',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './animal-edicao.html',
  styleUrl: './animal-edicao.css'
})
export class AnimalEdicao implements OnInit {
  animalForm!: FormGroup;
  animalId: number | null = null;
  isLoading = true;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private animalService: AnimalService,
    private cdr: ChangeDetectorRef
  ) {}

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

    this.route.paramMap.subscribe(params => {
      const idParam = params.get('id');
      const id = Number(idParam);

      if (!idParam || isNaN(id) || id <= 0) {
        this.errorMessage = 'Identificador de animal inválido.';
        this.isLoading = false;
        this.cdr.detectChanges();
        return;
      }

      this.animalId = id;
      this.carregarAnimal(id);
    });
  }

  carregarAnimal(id: number): void {
    this.isLoading = true;
    this.errorMessage = '';
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
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        this.isLoading = false;
        if (err.status === 404) {
          this.errorMessage = 'Animal não encontrado ou você não possui permissão para acessá-lo.';
        } else if (err.status === 401 || err.status === 403) {
          this.errorMessage = 'Sessão expirada. Faça login novamente.';
        } else {
          this.errorMessage = 'Erro ao carregar dados do animal. Verifique se o backend está em execução.';
        }
        this.cdr.detectChanges();
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
        this.cdr.detectChanges();
        setTimeout(() => this.voltar(), 1500);
      },
      error: (err: any) => {
        this.isSubmitting = false;
        if (err.status === 400 && err.error?.message?.includes('código de identificação')) {
          this.errorMessage = 'O código de identificação não pode ser alterado.';
        } else {
          this.errorMessage = 'Erro ao atualizar dados do animal. Tente novamente.';
        }
        this.cdr.detectChanges();
      }
    });
  }

  voltar(): void {
    if (this.animalId) {
      this.router.navigate(['/dashboard/rebanho', this.animalId]);
    } else {
      this.router.navigate(['/dashboard/rebanho']);
    }
  }
}
