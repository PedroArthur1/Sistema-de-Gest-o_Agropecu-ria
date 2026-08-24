import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Consulta } from '../../models/consulta.model';

@Injectable({
  providedIn: 'root'
})
export class ConsultaService {

  private apiUrl = 'http://localhost:8080/consultas';

  constructor(private http: HttpClient) {}

  registrar(consulta: Consulta): Observable<Consulta> {
    return this.http.post<Consulta>(this.apiUrl, consulta);
  }

  listarPorAnimal(animalId: number): Observable<Consulta[]> {
    return this.http.get<Consulta[]>(`${this.apiUrl}/animal/${animalId}`);
  }

  buscarPorId(id: number): Observable<Consulta> {
    return this.http.get<Consulta>(`${this.apiUrl}/${id}`);
  }
}
