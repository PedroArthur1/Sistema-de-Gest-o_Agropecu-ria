import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header {
  role: string | null;
  userName: string | null;
  pageTitle = 'Painel de Controle';

  constructor(private authService: AuthService, private router: Router) {
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
