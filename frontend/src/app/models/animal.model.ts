export interface Animal {
  id?: number;
  codigoIdentificacao: string;
  especie: string;
  raca: string;
  sexo: 'MACHO' | 'FEMEA' | string;
  dataNascimentoOuIdade: string;
  peso: number;
  condicaoSaude: string;
  observacoes?: string;
}
