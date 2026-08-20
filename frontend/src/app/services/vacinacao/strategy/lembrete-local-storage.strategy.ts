import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { LembreteVacinacaoStrategy } from './lembrete-vacinacao.strategy';
import { Lembrete, StatusLembrete } from '../../../models/lembrete.model';
import { Animal } from '../../../models/animal.model';
import { Vacinacao } from '../../../models/vacinacao.model';

@Injectable({
  providedIn: 'root'
})
export class LembreteLocalStorageStrategy implements LembreteVacinacaoStrategy {

  buscarLembretes(): Observable<Lembrete[]> {
    const animaisDb = localStorage.getItem('animais_mock_db');
    const animais: Animal[] = animaisDb ? JSON.parse(animaisDb) : [];

    const vacinasDb = localStorage.getItem('vacinacoes_mock_db');
    const vacinacoes: Vacinacao[] = vacinasDb ? JSON.parse(vacinasDb) : [];

    const lembretes: Lembrete[] = [];
    const hojeStr = new Date().toISOString().split('T')[0];

    vacinacoes.forEach(vacina => {
      const animal = animais.find(a => a.id === vacina.animalId);
      
      if (animal) {
        let status: StatusLembrete = 'Próxima';
        
        if (vacina.dataProximaDose < hojeStr) {
          status = 'Atrasada';
        } else if (vacina.dataProximaDose === hojeStr) {
          status = 'Hoje';
        }

        lembretes.push({
          animalId: animal.id!,
          codigoAnimal: animal.codigoIdentificacao,
          nomeAnimal: `${animal.especie} / ${animal.raca}`,
          vacina: vacina.nomeVacina,
          dataPrevista: vacina.dataProximaDose,
          status: status
        });
      }
    });

    lembretes.sort((a, b) => {
      if (a.status === 'Atrasada' && b.status !== 'Atrasada') return -1;
      if (b.status === 'Atrasada' && a.status !== 'Atrasada') return 1;
      return a.dataPrevista.localeCompare(b.dataPrevista);
    });

    return of(lembretes);
  }
}

