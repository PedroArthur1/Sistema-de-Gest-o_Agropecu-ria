import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IndicadoresRebanho } from '../../models/indicadores.model';
import { environment } from '../../../environments/environment';

/**
 * Serviço responsável por buscar os indicadores consolidados do rebanho
 * a partir do endpoint dedicado no backend.
 */
@Injectable({
  providedIn: 'root'
})
export class IndicadoresService {
  private apiUrl = `${environment.apiUrl}/animais/indicadores`;

  constructor(private http: HttpClient) {}

  buscarIndicadores(): Observable<IndicadoresRebanho> {
    return this.http.get<IndicadoresRebanho>(this.apiUrl);
  }
}
