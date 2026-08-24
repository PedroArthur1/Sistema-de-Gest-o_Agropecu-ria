export interface Consulta {
  id?: number;
  animalId: number;
  dataConsulta: string; // Formato: YYYY-MM-DD
  motivo: string;
  profissionalResponsavel: string;
  diagnostico?: string;
  observacoes?: string;
  tratamentoIds?: number[];
}
