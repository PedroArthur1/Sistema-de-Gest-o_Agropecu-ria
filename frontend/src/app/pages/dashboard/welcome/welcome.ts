import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth/auth.service';
import { AnimalService } from '../../../services/animal/animal.service';
import { NotificacaoService } from '../../../services/notificacao/notificacao.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './welcome.html',
  styleUrl: './welcome.css',
})
export class Welcome implements OnInit, OnDestroy {
  role: string | null = '';
  userName: string | null = '';
  
  totalAnimais: number = 0;
  vacinasAtrasadas: number = 0;
  
  private sub: Subscription = new Subscription();

  constructor(
    private authService: AuthService,
    private animalService: AnimalService,
    private notificacaoService: NotificacaoService
  ) {}

  ngOnInit(): void {
    this.role = this.authService.getRole();
    this.userName = this.authService.getUserName();
    
    // Buscar total de animais reais
    this.sub.add(
      this.animalService.listarAnimais().subscribe(animais => {
        this.totalAnimais = animais ? animais.length : 0;
      })
    );
    
    // Buscar estado da vacinação
    this.sub.add(
      this.notificacaoService.estado$.subscribe(estado => {
        this.vacinasAtrasadas = estado.totalAtrasadas;
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
