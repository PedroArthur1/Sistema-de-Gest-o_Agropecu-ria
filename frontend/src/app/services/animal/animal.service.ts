import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Animal } from '../../models/animal.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AnimalService {
  private apiUrl = `${environment.apiUrl}/animais`;

  constructor(private http: HttpClient) {}

  cadastrarAnimal(animal: Animal): Observable<Animal> {
    return this.http.post<Animal>(this.apiUrl, animal);
  }

  listarAnimais(): Observable<Animal[]> {
    return this.http.get<Animal[]>(`${this.apiUrl}?t=${new Date().getTime()}`);
  }

  buscarAnimalPorId(id: number): Observable<Animal> {
    return this.http.get<Animal>(`${this.apiUrl}/${id}`);
  }

  atualizarAnimal(id: number, animal: Animal): Observable<Animal> {
    return this.http.put<Animal>(`${this.apiUrl}/${id}`, animal);
  }
}
