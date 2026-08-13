import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-animal-cadastro',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './animal-cadastro.html',
  styleUrl: './animal-cadastro.css'
})
export class AnimalCadastro implements OnInit {
  animalForm!: FormGroup;
  isSubmitting = false;
  successMessage = '';
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.animalForm = this.fb.group({
      codigoIdentificacao: ['', Validators.required],
      especie: ['', Validators.required],
      raca: ['', Validators.required],
      sexo: ['', Validators.required],
      dataNascimentoOuIdade: ['', Validators.required],
      peso: ['', [Validators.required, Validators.min(0)]],
      condicaoSaude: ['', Validators.required],
      observacoes: ['']
    });
  }

  onSubmit(): void {
    this.isSubmitting = true;
    this.successMessage = '';
    this.errorMessage = '';

    if (this.animalForm.invalid) {
      this.animalForm.markAllAsTouched();
      this.errorMessage = 'Por favor, preencha todos os campos obrigatórios.';
      this.isSubmitting = false;
      return;
    }

    // Simulando a chamada a um serviço backend
    setTimeout(() => {
      this.successMessage = 'Animal cadastrado com sucesso!';
      this.isSubmitting = false;
      this.animalForm.reset();
      
      // Retorna para a tela de rebanho após 2 segundos
      setTimeout(() => this.voltar(), 2000);
    }, 1000);
  }

  voltar(): void {
    this.router.navigate(['/dashboard/rebanho']);
  }
}
