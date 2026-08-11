import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Animal } from '../../models/animal.model';

@Injectable({
  providedIn: 'root'
})
export class AnimalService {
  private urlApi: string = 'http://localhost:8080/animais';

  constructor(private clienteHttp: HttpClient) {}

  cadastrarAnimal(animal: Animal): Observable<Animal> {
    return this.clienteHttp.post<Animal>(this.urlApi, animal);
  }

  listarAnimais(): Observable<Animal[]> {
    return this.clienteHttp.get<Animal[]>(this.urlApi);
  }
}
