import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { LembreteVacinacaoService } from '../vacinacao/lembrete-vacinacao.service';

export interface EstadoNotificacao {
  totalAtrasadas: number;
  totalHoje: number;
  totalProximas: number;
  totalGeralAtivas: number;
}

/**
 * Serviço de Notificações para controle de estado reativo (Padrão Observer).
 */
@Injectable({
  providedIn: 'root'
})
export class NotificacaoService {

  private estadoSource = new BehaviorSubject<EstadoNotificacao>({
    totalAtrasadas: 0,
    totalHoje: 0,
    totalProximas: 0,
    totalGeralAtivas: 0
  });

  public estado$ = this.estadoSource.asObservable();

  constructor(private lembreteService: LembreteVacinacaoService) {
    this.atualizarNotificacoes();
  }

  /**
   * Atualiza o estado das notificações buscando os dados mais recentes.
   */
  atualizarNotificacoes(): void {
    this.lembreteService.getLembretes().subscribe({
      next: (lembretes) => {
        let atrasadas = 0;
        let hoje = 0;
        let proximas = 0;

        lembretes.forEach(lembrete => {
          if (lembrete.status === 'Atrasada') atrasadas++;
          else if (lembrete.status === 'Hoje') hoje++;
          else proximas++;
        });

        this.estadoSource.next({
          totalAtrasadas: atrasadas,
          totalHoje: hoje,
          totalProximas: proximas,
          totalGeralAtivas: atrasadas + hoje
        });
      },
      error: () => {
        console.error('Falha ao atualizar notificações de vacinas');
      }
    });
  }
}

