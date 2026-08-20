import { Observable } from 'rxjs';
import { Lembrete } from '../../../models/lembrete.model';

/**
 * Interface Strategy para a busca de lembretes de vacinação.
 */
export interface LembreteVacinacaoStrategy {
  /**
   * Busca a lista de lembretes calculados para exibição.
   */
  buscarLembretes(): Observable<Lembrete[]>;
}

