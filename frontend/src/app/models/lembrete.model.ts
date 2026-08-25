export type StatusLembrete = "Atrasada" | "Hoje" | "Próxima";

export interface Lembrete {
  animalId: number;
  codigoAnimal: string;
  nomeAnimal: string; // Especie e Raca combinadas
  vacina: string;
  dataPrevista: string;
  status: StatusLembrete;
  tipo: "Vacina" | "Tratamento";
}