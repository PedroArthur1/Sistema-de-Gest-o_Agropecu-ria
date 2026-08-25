import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { Lembrete } from "../../models/lembrete.model";
import { LembreteVacinacaoStrategy } from "./strategy/lembrete-vacinacao.strategy";
import { LembreteHttpStrategy } from "./strategy/lembrete-http.strategy";

/**
 * Serviço de Contexto (Padrão Strategy).
 * Orquestra e fornece os lembretes para a UI, abstraindo a origem dos dados.
 */
@Injectable({
  providedIn: "root"
})
export class LembreteVacinacaoService {

  private strategy: LembreteVacinacaoStrategy;

  constructor(private httpStrategy: LembreteHttpStrategy) {
    this.strategy = this.httpStrategy;
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