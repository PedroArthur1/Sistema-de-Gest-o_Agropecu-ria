import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-rebanho',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './rebanho.html',
  styleUrl: './rebanho.css',
})
export class Rebanho {
  animais: any[] = []; // Array vazio força o Empty State
  
  abas = ['Todos os Animais', 'Vacinados', 'Em Tratamento', 'Mães', 'Filhotes'];
  abaAtiva = 'Todos os Animais';
}
