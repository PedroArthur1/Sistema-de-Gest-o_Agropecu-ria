import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Lembrete } from '../../models/lembrete.model';
import { LembreteVacinacaoStrategy } from './strategy/lembrete-vacinacao.strategy';
import { LembreteLocalStorageStrategy } from './strategy/lembrete-local-storage.strategy';
// import { LembreteHttpStrategy } from './strategy/lembrete-http.strategy'; // Descomentar quando o backend estiver pronto

/**
 * Serviço de Contexto (Padrão Strategy).
 * Orquestra e fornece os lembretes para a UI, abstraindo a origem dos dados.
 */
@Injectable({
  providedIn: 'root'
})
export class LembreteVacinacaoService {

  private strategy: LembreteVacinacaoStrategy;

  constructor(private localStorageStrategy: LembreteLocalStorageStrategy) {
    // Para a apresentação/desenvolvimento atual, utilizamos a estratégia de LocalStorage.
    // Futuramente, basta trocar `localStorageStrategy` por `httpStrategy` aqui.
    this.strategy = this.localStorageStrategy;
  }

  /**
   * Define dinamicamente qual estratégia será usada.
   */
  setStrategy(strategy: LembreteVacinacaoStrategy): void {
    this.strategy = strategy;
  }

  /**
   * Busca os lembretes utilizando a estratégia atualmente configurada.
   */
  getLembretes(): Observable<Lembrete[]> {
    return this.strategy.buscarLembretes();
  }
}
