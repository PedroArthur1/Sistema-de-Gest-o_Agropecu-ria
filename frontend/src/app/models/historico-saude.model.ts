export interface EventoSaude {
  idOrigem: number;
  tipo: 'VACINACAO' | 'TRATAMENTO' | 'CONSULTA';
  data: string;
  titulo: string;
  subtitulo?: string;
  descricao?: string;
  responsavel?: string;
  dataProxima?: string;
  consultaId?: number;
}

export interface HistoricoSaudeResumo {
  animalId: number;
  codigoAnimal: string;
  totalEventos: number;
  totalVacinas: number;
  totalTratamentos: number;
  totalConsultas: number;
  eventos: EventoSaude[];
}
