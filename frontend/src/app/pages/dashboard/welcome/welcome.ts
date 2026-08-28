import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth/auth.service';
import { AnimalService } from '../../../services/animal/animal.service';
import { NotificacaoService } from '../../../services/notificacao/notificacao.service';
import { Animal } from '../../../models/animal.model';
import { Subscription } from 'rxjs';

export interface DistribuicaoItem {
  nome: string;
  total: number;
  percentual: number;
  cor?: string;
}

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './welcome.html',
  styleUrl: './welcome.css',
})
export class Welcome implements OnInit, OnDestroy {
  role: string | null = '';
  userName: string | null = '';

  totalAnimais: number = 0;
  vacinasAtrasadas: number = 0;

  // Indicadores do rebanho
  pesoMedio: number = 0;
  totalMachos: number = 0;
  totalFemeas: number = 0;
  percentualMachos: number = 0;
  percentualFemeas: number = 0;
  distribuicaoEspecie: DistribuicaoItem[] = [];
  distribuicaoRaca: DistribuicaoItem[] = [];
  distribuicaoSaude: DistribuicaoItem[] = [];
  distribuicaoIdade: DistribuicaoItem[] = [];
  indicadoresCarregados: boolean = false;

  private sub: Subscription = new Subscription();

  // Cores para os gráficos de distribuição
  private coresEspecie = ['#16a34a', '#2563eb', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#be185d', '#65a30d'];
  private coresRaca = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#7c3aed', '#5b21b6', '#4c1d95'];
  private coresIdade = ['#22d3ee', '#3b82f6', '#8b5cf6'];

  private coresSaudeMap: Record<string, string> = {
    'saudavel': '#16a34a',
    'saudável': '#16a34a',
    'sadia': '#16a34a',
    'sadio': '#16a34a',
    'em tratamento': '#d97706',
    'doente': '#dc2626',
    'gestante': '#7c3aed',
    'prenha': '#7c3aed',
    'em observação': '#0891b2',
    'em observacao': '#0891b2',
    'convalescente': '#f59e0b',
  };

  constructor(
    private authService: AuthService,
    private animalService: AnimalService,
    private notificacaoService: NotificacaoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.role = this.authService.getRole();
    this.userName = this.authService.getUserName();

    // Buscar total de animais reais e calcular indicadores
    this.sub.add(
      this.animalService.listarAnimais().subscribe({
        next: (animais) => {
          const lista = animais ?? [];
          this.totalAnimais = lista.length;
          this.calcularIndicadores(lista);
          this.indicadoresCarregados = true;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Erro ao buscar animais na tela inicial:', err);
          this.totalAnimais = 0;
          this.indicadoresCarregados = true;
          this.cdr.detectChanges();
        }
      })
    );

    // Buscar estado da vacinação
    this.sub.add(
      this.notificacaoService.estado$.subscribe(estado => {
        this.vacinasAtrasadas = estado.totalAtrasadas;
        this.cdr.detectChanges();
      })
    );
  }

  /**
   * Calcula todos os indicadores consolidados a partir da lista de animais.
   */
  calcularIndicadores(animais: Animal[]): void {
    if (!animais || animais.length === 0) {
      this.pesoMedio = 0;
      this.totalMachos = 0;
      this.totalFemeas = 0;
      this.percentualMachos = 0;
      this.percentualFemeas = 0;
      this.distribuicaoEspecie = [];
      this.distribuicaoRaca = [];
      this.distribuicaoSaude = [];
      this.distribuicaoIdade = [];
      return;
    }

    const total = animais.length;

    // Peso médio
    const animaisComPeso = animais.filter(a => a.peso != null && a.peso > 0);
    this.pesoMedio = animaisComPeso.length > 0
      ? animaisComPeso.reduce((acc, a) => acc + a.peso, 0) / animaisComPeso.length
      : 0;

    // Distribuição por sexo
    this.totalMachos = animais.filter(a => (a.sexo || '').toUpperCase() === 'MACHO').length;
    this.totalFemeas = animais.filter(a => (a.sexo || '').toUpperCase() === 'FEMEA').length;
    this.percentualMachos = Math.round((this.totalMachos / total) * 100);
    this.percentualFemeas = Math.round((this.totalFemeas / total) * 100);

    // Distribuição por espécie
    this.distribuicaoEspecie = this.agruparPor(animais, 'especie', total, this.coresEspecie);

    // Distribuição por raça (top 6 + "Outras")
    this.distribuicaoRaca = this.agruparPorComLimite(animais, 'raca', total, 6, this.coresRaca);

    // Distribuição por condição de saúde
    this.distribuicaoSaude = this.agruparPor(animais, 'condicaoSaude', total).map((item, i) => ({
      ...item,
      cor: this.coresSaudeMap[item.nome.toLowerCase()] || this.coresEspecie[i % this.coresEspecie.length]
    }));

    // Distribuição por faixa etária
    this.distribuicaoIdade = this.calcularFaixasEtarias(animais, total);
  }

  /**
   * Agrupa animais por uma propriedade e retorna a distribuição.
   */
  private agruparPor(animais: Animal[], campo: keyof Animal, total: number, cores?: string[]): DistribuicaoItem[] {
    const mapa = new Map<string, number>();

    animais.forEach(a => {
      const valor = ((a[campo] as string) || 'Não informado').trim();
      const chave = valor.charAt(0).toUpperCase() + valor.slice(1).toLowerCase();
      mapa.set(chave, (mapa.get(chave) || 0) + 1);
    });

    return Array.from(mapa.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([nome, count], i) => ({
        nome,
        total: count,
        percentual: Math.round((count / total) * 100),
        cor: cores ? cores[i % cores.length] : undefined
      }));
  }

  /**
   * Agrupa por campo com limite máximo de itens, agrupando o restante em "Outras".
   */
  private agruparPorComLimite(animais: Animal[], campo: keyof Animal, total: number, limite: number, cores: string[]): DistribuicaoItem[] {
    const todos = this.agruparPor(animais, campo, total, cores);

    if (todos.length <= limite) {
      return todos;
    }

    const top = todos.slice(0, limite);
    const restante = todos.slice(limite);
    const totalRestante = restante.reduce((acc, item) => acc + item.total, 0);

    top.push({
      nome: 'Outras',
      total: totalRestante,
      percentual: Math.round((totalRestante / total) * 100),
      cor: '#94a3b8'
    });

    return top;
  }

  /**
   * Calcula a distribuição por faixas etárias com base em dataNascimentoOuIdade.
   */
  private calcularFaixasEtarias(animais: Animal[], total: number): DistribuicaoItem[] {
    const hoje = new Date();
    let jovem = 0;
    let adulto = 0;
    let idoso = 0;
    let naoInformado = 0;

    animais.forEach(a => {
      if (!a.dataNascimentoOuIdade || isNaN(Date.parse(a.dataNascimentoOuIdade))) {
        naoInformado++;
        return;
      }

      const nascimento = new Date(a.dataNascimentoOuIdade);
      const diffMs = hoje.getTime() - nascimento.getTime();
      const anos = diffMs / (1000 * 60 * 60 * 24 * 365.25);

      if (anos < 1) jovem++;
      else if (anos <= 5) adulto++;
      else idoso++;
    });

    const resultado: DistribuicaoItem[] = [];

    if (jovem > 0) resultado.push({ nome: 'Jovem (< 1 ano)', total: jovem, percentual: Math.round((jovem / total) * 100), cor: this.coresIdade[0] });
    if (adulto > 0) resultado.push({ nome: 'Adulto (1–5 anos)', total: adulto, percentual: Math.round((adulto / total) * 100), cor: this.coresIdade[1] });
    if (idoso > 0) resultado.push({ nome: 'Idoso (> 5 anos)', total: idoso, percentual: Math.round((idoso / total) * 100), cor: this.coresIdade[2] });
    if (naoInformado > 0) resultado.push({ nome: 'Não informado', total: naoInformado, percentual: Math.round((naoInformado / total) * 100), cor: '#94a3b8' });

    return resultado;
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
