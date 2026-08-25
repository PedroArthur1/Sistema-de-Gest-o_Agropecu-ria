import { Injectable } from "@angular/core";
import { Observable, map } from "rxjs";
import { LembreteVacinacaoStrategy } from "./lembrete-vacinacao.strategy";
import { Lembrete, StatusLembrete } from "../../../models/lembrete.model";
import { Animal } from "../../../models/animal.model";
import { Vacinacao } from "../../../models/vacinacao.model";
import { AnimalService } from "../../animal/animal.service";

@Injectable({
  providedIn: "root"
})
export class LembreteLocalStorageStrategy implements LembreteVacinacaoStrategy {

  constructor(private animalService: AnimalService) {}

  buscarLembretes(): Observable<Lembrete[]> {
    return this.animalService.listarAnimais().pipe(
      map(animais => {
        const vacinasDb = localStorage.getItem("vacinacoes_mock_db");
        const vacinacoes: Vacinacao[] = vacinasDb ? JSON.parse(vacinasDb) : [];

        const lembretes: Lembrete[] = [];
        const hojeStr = new Date().toISOString().split("T")[0];

        vacinacoes.forEach(vacina => {
          const animal = animais.find(a => a.id === vacina.animalId);
          
          if (animal) {
            let status: StatusLembrete = "Próxima";
            
            if (vacina.dataProximaDose < hojeStr) {
              status = "Atrasada";
            } else if (vacina.dataProximaDose === hojeStr) {
              status = "Hoje";
            }

            lembretes.push({
              animalId: animal.id!,
              codigoAnimal: animal.codigoIdentificacao,
              nomeAnimal: `${animal.especie} / ${animal.raca}`,
              vacina: vacina.nomeVacina,
              dataPrevista: vacina.dataProximaDose,
              status: status,
              tipo: "Vacina"
            });
          }
        });

        lembretes.sort((a, b) => {
          if (a.status === "Atrasada" && b.status !== "Atrasada") return -1;
          if (b.status === "Atrasada" && a.status !== "Atrasada") return 1;
          return a.dataPrevista.localeCompare(b.dataPrevista);
        });

        return lembretes;
      })
    );
  }
}