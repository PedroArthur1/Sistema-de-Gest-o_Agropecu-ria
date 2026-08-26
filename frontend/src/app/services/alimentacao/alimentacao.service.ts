import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Alimentacao {
  id?: number;
  animalIds: number[];
  tipoAlimento: string;
  quantidade: string;
  data: string;
  observacoes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AlimentacaoService {
  private apiUrl = `${environment.apiUrl}/alimentacoes`;

  constructor(private http: HttpClient) {}

  registrarAlimentacao(alimentacao: Alimentacao): Observable<Alimentacao> {
    return this.http.post<Alimentacao>(this.apiUrl, alimentacao);
  }

  listarPorAnimal(animalId: number): Observable<Alimentacao[]> {
    return this.http.get<Alimentacao[]>(`${this.apiUrl}/animal/${animalId}`);
  }

  listarTodas(): Observable<Alimentacao[]> {
    return this.http.get<Alimentacao[]>(this.apiUrl);
  }
}
