import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AnimalService } from '../../../../services/animal/animal.service';
import { getBrowserStorage } from '../../../../utils/browser-storage';

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
  animaisExistentes: any[] = [];

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

    // Carrega a lista de animais para evitar códigos duplicados
    this.carregarAnimaisExistentes();

    // Gera código automático ao mudar a espécie
    this.animalForm.get('especie')?.valueChanges.subscribe(especie => {
      if (especie) {
        this.gerarCodigoAutomatico(especie);
      }
    });
  }

  private carregarAnimaisExistentes(): void {
    this.animalService.listarAnimais().subscribe({
      next: (animais) => {
        this.animaisExistentes = animais || [];
        const especieAtual = this.animalForm.get('especie')?.value;
        if (especieAtual) {
          this.gerarCodigoAutomatico(especieAtual);
        }
      },
      error: () => {
        this.animaisExistentes = [];
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
    
    // Procura o maior número já existente para este prefixo
    let maiorNumero = 0;
    if (this.animaisExistentes && this.animaisExistentes.length > 0) {
      this.animaisExistentes.forEach(a => {
        const codigo = a.codigoIdentificacao || '';
        if (codigo.startsWith(prefixo + '-')) {
          const numStr = codigo.replace(prefixo + '-', '');
          const num = parseInt(numStr, 10);
          if (!isNaN(num) && num > maiorNumero) {
            maiorNumero = num;
          }
        }
      });
    }

    // Se não houver animais no backend para o prefixo, verifica localStorage como fallback
    if (maiorNumero === 0) {
      const storageKey = `contador_especie_${especie}`;
      const contadorAtual = parseInt(getBrowserStorage().getItem(storageKey) || '1', 10);
      maiorNumero = contadorAtual > 1 ? contadorAtual - 1 : 0;
    }

    const proximoNumero = maiorNumero + 1;
    const numeroFormatado = proximoNumero.toString().padStart(3, '0');
    
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

    // Atualiza contador local
    const especie = this.animalForm.get('especie')?.value;
    const storageKey = `contador_especie_${especie}`;
    const storage = getBrowserStorage();
    const contadorAtual = parseInt(storage.getItem(storageKey) || '1', 10);
    storage.setItem(storageKey, (contadorAtual + 1).toString());

    // Salva o animal usando o serviço
    this.animalService.cadastrarAnimal(this.animalForm.getRawValue()).subscribe({
      next: () => {
        this.successMessage = 'Animal cadastrado com sucesso!';
        this.isSubmitting = false;
        this.animalForm.reset();
        
        // Retorna para a tela de rebanho após 2 segundos
        setTimeout(() => this.voltar(), 2000);
      },
      error: (err: any) => {
        this.errorMessage = err?.error?.error || err?.error?.message || 'Erro ao cadastrar animal. Tente novamente.';
        this.isSubmitting = false;
      }
    });
  }

  voltar(): void {
    this.router.navigate(['/dashboard/rebanho']);
  }
}
