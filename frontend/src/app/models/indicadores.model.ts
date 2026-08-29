export interface DistribuicaoItem {
  nome: string;
  total: number;
  percentual: number;
  cor?: string; // Aplicado pelo frontend para fins de visualização
}

export interface IndicadoresRebanho {
  totalAnimais: number;
  pesoMedio: number;
  totalMachos: number;
  totalFemeas: number;
  percentualMachos: number;
  percentualFemeas: number;
  distribuicaoEspecie: DistribuicaoItem[];
  distribuicaoRaca: DistribuicaoItem[];
  distribuicaoSaude: DistribuicaoItem[];
  distribuicaoIdade: DistribuicaoItem[];
}
