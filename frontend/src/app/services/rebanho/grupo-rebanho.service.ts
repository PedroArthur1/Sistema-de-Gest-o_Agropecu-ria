import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GrupoRebanho } from '../../models/grupo-rebanho.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class GrupoRebanhoService {
  private apiUrl = `${environment.apiUrl}/grupos-rebanho`;

  constructor(private http: HttpClient) {}

  listarGrupos(): Observable<GrupoRebanho[]> {
    return this.http.get<GrupoRebanho[]>(this.apiUrl);
  }

  buscarPorId(id: number): Observable<GrupoRebanho> {
    return this.http.get<GrupoRebanho>(`${this.apiUrl}/${id}`);
  }

  criarGrupo(grupo: Partial<GrupoRebanho>): Observable<GrupoRebanho> {
    return this.http.post<GrupoRebanho>(this.apiUrl, grupo);
  }

  atualizarGrupo(id: number, grupo: Partial<GrupoRebanho>): Observable<GrupoRebanho> {
    return this.http.put<GrupoRebanho>(`${this.apiUrl}/${id}`, grupo);
  }

  excluirGrupo(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
