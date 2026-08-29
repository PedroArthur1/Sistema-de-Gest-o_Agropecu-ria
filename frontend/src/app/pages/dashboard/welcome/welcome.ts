import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth/auth.service';
import { IndicadoresService } from '../../../services/indicadores/indicadores.service';
import { NotificacaoService } from '../../../services/notificacao/notificacao.service';
import { DistribuicaoItem } from '../../../models/indicadores.model';
import { Subscription } from 'rxjs';

// Re-exportar para manter compatibilidade com outros componentes que possam importar daqui
export type { DistribuicaoItem };

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

  // Indicadores do rebanho — preenchidos pelo backend
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

  // Paletas de cores aplicadas no frontend após receber os dados
  private coresEspecie = ['#16a34a', '#2563eb', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#be185d', '#65a30d'];
  private coresRaca    = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#7c3aed', '#5b21b6', '#4c1d95', '#94a3b8'];
  private coresIdade   = ['#22d3ee', '#3b82f6', '#8b5cf6', '#94a3b8'];

  private coresSaudeMap: Record<string, string> = {
    'saudavel':       '#16a34a',
    'saudável':       '#16a34a',
    'sadia':          '#16a34a',
    'sadio':          '#16a34a',
    'em tratamento':  '#d97706',
    'doente':         '#dc2626',
    'gestante':       '#7c3aed',
    'prenha':         '#7c3aed',
    'em observação':  '#0891b2',
    'em observacao':  '#0891b2',
    'convalescente':  '#f59e0b',
  };

  constructor(
    private authService: AuthService,
    private indicadoresService: IndicadoresService,
    private notificacaoService: NotificacaoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.role = this.authService.getRole();
    this.userName = this.authService.getUserName();

    // Buscar indicadores consolidados do backend
    this.sub.add(
      this.indicadoresService.buscarIndicadores().subscribe({
        next: (dados) => {
          this.totalAnimais      = dados.totalAnimais;
          this.pesoMedio         = dados.pesoMedio;
          this.totalMachos       = dados.totalMachos;
          this.totalFemeas       = dados.totalFemeas;
          this.percentualMachos  = dados.percentualMachos;
          this.percentualFemeas  = dados.percentualFemeas;

          // Aplicar cores às distribuições (lógica puramente visual, pertence ao frontend)
          this.distribuicaoEspecie = this.aplicarCores(dados.distribuicaoEspecie, this.coresEspecie);
          this.distribuicaoRaca    = this.aplicarCores(dados.distribuicaoRaca,    this.coresRaca);
          this.distribuicaoSaude   = this.aplicarCoresSaude(dados.distribuicaoSaude);
          this.distribuicaoIdade   = this.aplicarCores(dados.distribuicaoIdade,   this.coresIdade);

          this.indicadoresCarregados = true;
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Erro ao buscar indicadores do rebanho:', err);
          this.indicadoresCarregados = true;
          this.cdr.detectChanges();
        }
      })
    );

    // Buscar estado das notificações de vacinação
    this.sub.add(
      this.notificacaoService.estado$.subscribe(estado => {
        this.vacinasAtrasadas = estado.totalAtrasadas;
        this.cdr.detectChanges();
      })
    );
  }

  /**
   * Aplica uma paleta de cores sequencialmente aos itens da distribuição.
   */
  private aplicarCores(items: DistribuicaoItem[], cores: string[]): DistribuicaoItem[] {
    return items.map((item, i) => ({ ...item, cor: cores[i % cores.length] }));
  }

  /**
   * Aplica cores semânticas (mapa de condição de saúde) aos itens de saúde.
   * Itens sem cor mapeada recebem uma cor da paleta padrão.
   */
  private aplicarCoresSaude(items: DistribuicaoItem[]): DistribuicaoItem[] {
    return items.map((item, i) => ({
      ...item,
      cor: this.coresSaudeMap[item.nome.toLowerCase()] ?? this.coresEspecie[i % this.coresEspecie.length]
    }));
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
