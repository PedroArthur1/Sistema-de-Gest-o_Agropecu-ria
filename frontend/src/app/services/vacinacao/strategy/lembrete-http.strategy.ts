import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { LembreteVacinacaoStrategy } from './lembrete-vacinacao.strategy';
import { Lembrete } from '../../../models/lembrete.model';
import { environment } from '../../../../environments/environment';

/**
 * Estratégia HTTP para busca de lembretes de vacinação.
 * Implementa o acesso a dados integrando com o backend.
 */
@Injectable({
  providedIn: 'root'
})
export class LembreteHttpStrategy implements LembreteVacinacaoStrategy {

  private apiUrl = `${environment.apiUrl}/vacinacoes`;

  constructor(private http: HttpClient) {}

  buscarLembretes(): Observable<Lembrete[]> {
    return this.http.get<Lembrete[]>(`${this.apiUrl}/lembretes`);
  }
}

