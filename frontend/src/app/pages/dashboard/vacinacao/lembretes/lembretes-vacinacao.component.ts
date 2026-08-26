import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LembreteVacinacaoService } from '../../../../services/vacinacao/lembrete-vacinacao.service';
import { Lembrete } from '../../../../models/lembrete.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-lembretes-vacinacao',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './lembretes-vacinacao.html',
  styleUrl: './lembretes-vacinacao.css'
})
export class LembretesVacinacaoComponent implements OnInit, OnDestroy {

  lembretes: Lembrete[] | null = null;
  private sub: Subscription = new Subscription();

  constructor(
    private lembreteService: LembreteVacinacaoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.sub.add(
      this.lembreteService.getLembretes().subscribe({
        next: (dados) => {
          console.log('[Lembretes] Recebido:', dados);
          this.lembretes = dados ?? [];
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('[Lembretes] Erro ao buscar:', err);
          this.lembretes = [];
          this.cdr.detectChanges();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  getBadgeClass(status: string): string {
    switch (status) {
      case 'Atrasada': return 'badge-atrasada';
      case 'Hoje': return 'badge-hoje';
      default: return 'badge-proxima';
    }
  }
}

