import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Animal } from '../../models/animal.model';

@Injectable({
  providedIn: 'root'
})
export class AnimalService {
  private apiUrl = 'http://localhost:8080/animais';

  constructor(private http: HttpClient) {}

  cadastrarAnimal(animal: Animal): Observable<Animal> {
    return this.http.post<Animal>(this.apiUrl, animal);
  }

  listarAnimais(): Observable<Animal[]> {
    return this.http.get<Animal[]>(this.apiUrl);
  }
}
