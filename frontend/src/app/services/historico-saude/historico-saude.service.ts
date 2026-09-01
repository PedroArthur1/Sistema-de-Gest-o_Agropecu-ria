import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HistoricoSaudeResumo } from '../../models/historico-saude.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class HistoricoSaudeService {
  private readonly baseUrl = `${environment.apiUrl}/animais`;

  constructor(private http: HttpClient) {}

  buscarHistoricoConsolidado(animalId: number): Observable<HistoricoSaudeResumo> {
    return this.http.get<HistoricoSaudeResumo>(`${this.baseUrl}/${animalId}/historico-saude`);
  }
}
