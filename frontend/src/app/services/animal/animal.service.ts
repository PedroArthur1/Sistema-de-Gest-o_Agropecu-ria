import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Animal } from '../../models/animal.model';

@Injectable({
  providedIn: 'root'
})
export class AnimalService {
  private storageKey = 'animais_mock_db';

  constructor() {}

  cadastrarAnimal(animal: Animal): Observable<Animal> {
    const animais = this.obterAnimaisDoStorage();
    animal.id = new Date().getTime(); // Gera ID único
    animais.push(animal);
    localStorage.setItem(this.storageKey, JSON.stringify(animais));
    return of(animal);
  }

  listarAnimais(): Observable<Animal[]> {
    return of(this.obterAnimaisDoStorage());
  }

  private obterAnimaisDoStorage(): Animal[] {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }
}
