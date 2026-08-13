export interface Vacinacao {
  id?: number;
  animalId: number;
  nomeVacina: string;
  dataAplicacao: string;
  dose: string;
  responsavel: string;
  dataProximaDose: string;
}

export interface VacinacaoRequest {
  nomeVacina: string;
  dataAplicacao: string;
  dose: string;
  responsavel: string;
  dataProximaDose: string;
}
