import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AnimalService } from '../../../services/animal/animal.service';
import { Animal } from '../../../models/animal.model';

@Component({
  selector: 'app-rebanho',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './rebanho.html',
  styleUrl: './rebanho.css',
})
export class Rebanho implements OnInit {
  animais: Animal[] = []; 
  
  abas = ['Todos os Animais', 'Vacinados', 'Em Tratamento', 'Mães', 'Filhotes'];
  abaAtiva = 'Todos os Animais';

  constructor(
    private animalService: AnimalService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregarAnimais();
  }

  carregarAnimais(): void {
    this.animalService.listarAnimais().subscribe({
      next: (dados) => {
        this.animais = dados ?? [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao carregar animais:', err);
        this.animais = [];
        this.cdr.detectChanges();
      }
    });
  }
}

