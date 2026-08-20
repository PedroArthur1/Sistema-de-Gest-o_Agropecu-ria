import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { filter, Observable } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';
import { NotificacaoService, EstadoNotificacao } from '../../services/notificacao/notificacao.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  role: string | null;
  userName: string | null;
  pageTitle = 'Painel de Controle';
  notificacoes$: Observable<EstadoNotificacao>;

  constructor(
    private authService: AuthService,
    private router: Router,
    private notificacaoService: NotificacaoService
  ) {
    this.notificacoes$ = this.notificacaoService.estado$;
    this.role = this.authService.getRole();
    this.userName = this.authService.getUserName();
    this.atualizarTitulo(this.router.url);
    this.router.events
      .pipe(filter((evento): evento is NavigationEnd => evento instanceof NavigationEnd))
      .subscribe((evento) => this.atualizarTitulo(evento.urlAfterRedirects));
  }

  private atualizarTitulo(url: string): void {
    if (url.includes('/vacinacao')) {
      this.pageTitle = 'Vacinação';
    } else if (url.includes('/rebanho/novo')) {
      this.pageTitle = 'Cadastrar Animal';
    } else if (url.includes('/rebanho')) {
      this.pageTitle = 'Rebanho';
    } else {
      this.pageTitle = 'Painel de Controle';
    }
  }

  onLogout(): void {
    this.authService.logout();
  }
}

