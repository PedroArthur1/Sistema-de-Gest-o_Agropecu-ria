import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AnimalService } from '../../../../../services/animal/animal.service';

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
    private router: Router,
    private animalService: AnimalService
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

    // Gera código automático ao mudar a espécie
    this.animalForm.get('especie')?.valueChanges.subscribe(especie => {
      if (especie) {
        this.gerarCodigoAutomatico(especie);
      }
    });
  }

  private gerarCodigoAutomatico(especie: string): void {
    const prefixos: Record<string, string> = {
      'Bovino': 'BOV',
      'Suíno': 'SUI',
      'Equino': 'EQU',
      'Ovino': 'OVI',
      'Outro': 'OUT'
    };
    
    const prefixo = prefixos[especie] || 'ANI';
    
    // Recupera o contador atual da espécie no LocalStorage (ou inicia em 1)
    const storageKey = `contador_especie_${especie}`;
    const contadorAtual = parseInt(localStorage.getItem(storageKey) || '1', 10);
    
    // Formata o número sequencial com zeros à esquerda (ex: 001)
    const numeroFormatado = contadorAtual.toString().padStart(3, '0');
    
    this.animalForm.patchValue({
      codigoIdentificacao: `${prefixo}-${numeroFormatado}`
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

    // Incrementa o contador para a próxima vez que a espécie for cadastrada
    const especie = this.animalForm.get('especie')?.value;
    const storageKey = `contador_especie_${especie}`;
    const contadorAtual = parseInt(localStorage.getItem(storageKey) || '1', 10);
    localStorage.setItem(storageKey, (contadorAtual + 1).toString());

    // Salva o animal usando o serviço
    this.animalService.cadastrarAnimal(this.animalForm.getRawValue()).subscribe({
      next: () => {
        this.successMessage = 'Animal cadastrado com sucesso!';
        this.isSubmitting = false;
        this.animalForm.reset();
        
        // Retorna para a tela de rebanho após 2 segundos
        setTimeout(() => this.voltar(), 2000);
      },
      error: () => {
        this.errorMessage = 'Erro ao cadastrar animal. Tente novamente.';
        this.isSubmitting = false;
      }
    });
  }

  voltar(): void {
    this.router.navigate(['/dashboard/rebanho']);
  }
}
