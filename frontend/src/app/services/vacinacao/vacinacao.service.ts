import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Vacinacao, VacinacaoRequest } from '../../models/vacinacao.model';

@Injectable({
  providedIn: 'root'
})
export class VacinacaoService {
  private apiUrl = 'http://localhost:8080/animais';

  constructor(private http: HttpClient) {}

  registrar(animalId: number, vacinacao: VacinacaoRequest): Observable<Vacinacao> {
    return this.http.post<Vacinacao>(`${this.apiUrl}/${animalId}/vacinacoes`, vacinacao);
  }

  listarHistorico(animalId: number): Observable<Vacinacao[]> {
    return this.http.get<Vacinacao[]>(`${this.apiUrl}/${animalId}/vacinacoes`);
  }
}
