import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';
import { AnimalService } from '../../services/animal/animal.service';
import { Animal } from '../../models/animal.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent implements OnInit {
  perfil: string | null;
  animais: Animal[] = [];
  estaCarregando: boolean = false;

  constructor(
    private servicoAutenticacao: AuthService,
    private servicoAnimal: AnimalService,
    private roteador: Router
  ) {
    this.perfil = this.servicoAutenticacao.getRole();
  }

  ngOnInit(): void {
    this.carregarAnimais();
  }

  carregarAnimais(): void {
    this.estaCarregando = true;
    this.servicoAnimal.listarAnimais().subscribe({
      next: (dados) => {
        this.animais = dados || [];
        this.estaCarregando = false;
      },
      error: () => {
        this.estaCarregando = false;
      }
    });
  }

  sair(): void {
    this.servicoAutenticacao.logout().subscribe({
      next: () => this.roteador.navigate(['/login']),
      error: () => this.roteador.navigate(['/login'])
    });
  }
}
