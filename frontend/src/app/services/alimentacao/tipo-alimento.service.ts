import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TipoAlimento } from '../../models/tipo-alimento.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TipoAlimentoService {
  private apiUrl = `${environment.apiUrl}/tipos-alimento`;

  constructor(private http: HttpClient) {}

  listarTiposAlimento(): Observable<TipoAlimento[]> {
    return this.http.get<TipoAlimento[]>(this.apiUrl);
  }

  buscarPorId(id: number): Observable<TipoAlimento> {
    return this.http.get<TipoAlimento>(`${this.apiUrl}/${id}`);
  }

  criarTipoAlimento(tipoAlimento: TipoAlimento): Observable<TipoAlimento> {
    return this.http.post<TipoAlimento>(this.apiUrl, tipoAlimento);
  }

  atualizarTipoAlimento(id: number, tipoAlimento: TipoAlimento): Observable<TipoAlimento> {
    return this.http.put<TipoAlimento>(`${this.apiUrl}/${id}`, tipoAlimento);
  }

  excluirTipoAlimento(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
