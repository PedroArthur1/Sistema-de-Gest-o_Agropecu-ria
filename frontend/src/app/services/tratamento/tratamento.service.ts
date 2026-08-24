import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Tratamento {
  id?: number;
  animalId: number;
  medicamento: string;
  data: string; // Formato esperado pelo banco: YYYY-MM-DD
  motivo: string;
  dosagem?: string;
  observacoes?: string;
}

@Injectable({
  providedIn: 'root'
})
export class TratamentoService {

  private apiUrl = `${environment.apiUrl}/tratamentos`;

  constructor(private http: HttpClient) {}

  registrarTratamento(tratamento: Tratamento): Observable<Tratamento> {
    return this.http.post<Tratamento>(this.apiUrl, tratamento);
  }

  listarPorAnimal(animalId: number): Observable<Tratamento[]> {
    return this.http.get<Tratamento[]>(`${this.apiUrl}/animal/${animalId}`);
  }
}
