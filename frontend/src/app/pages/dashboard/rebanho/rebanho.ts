import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AnimalService } from '../../../services/animal/animal.service';
import { LembreteVacinacaoService } from '../../../services/vacinacao/lembrete-vacinacao.service';
import { Animal } from '../../../models/animal.model';
import { GruposRebanhoComponent } from './grupos-rebanho/grupos-rebanho';

@Component({
  selector: 'app-rebanho',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, GruposRebanhoComponent],
  templateUrl: './rebanho.html',
  styleUrl: './rebanho.css',
})
export class Rebanho implements OnInit {
  visaoAtiva: 'animais' | 'lotes' = 'animais';

  animais: Animal[] = []; 
  termoPesquisa: string = '';
  
  abas = ['Todos os Animais', 'Vacinados', 'Em Tratamento', 'Mães', 'Filhotes'];
  abaAtiva = 'Todos os Animais';
  animaisVacinadosIds = new Set<number>();

  constructor(
    private animalService: AnimalService,
    private lembreteVacinacaoService: LembreteVacinacaoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregarAnimais();
  }

  carregarAnimais(): void {
    this.animalService.listarAnimais().subscribe({
      next: (dados) => {
        this.animais = dados ?? [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Erro ao carregar animais:', err);
        this.animais = [];
        this.cdr.detectChanges();
      }
    });

    this.lembreteVacinacaoService.getLembretes().subscribe({
      next: (lembretes) => {
        const ids = new Set<number>();
        (lembretes || []).forEach(l => {
          if (l.animalId) ids.add(l.animalId);
        });
        this.animaisVacinadosIds = ids;
        this.cdr.detectChanges();
      },
      error: () => {
        // Falha no carregamento de lembretes não impede exibição do rebanho
      }
    });
  }

  limparPesquisa(): void {
    this.termoPesquisa = '';
  }

  isFilhote(animal: Animal): boolean {
    const str = (animal.dataNascimentoOuIdade || '').trim().toLowerCase();
    if (!str) return false;

    // Se for data no formato ISO
    if (!isNaN(Date.parse(str))) {
      const nascimento = new Date(str);
      const hoje = new Date();
      const diffTime = hoje.getTime() - nascimento.getTime();
      const diffAnos = diffTime / (1000 * 60 * 60 * 24 * 365.25);
      return diffAnos >= 0 && diffAnos < 1;
    }

    // Se for texto descritivo
    const termosFilhote = ['mês', 'mes', 'meses', 'dia', 'dias', 'filhote', 'bezerro', 'bezerra', 'leitão', 'leitao', 'potro', 'cordeiro', 'borrego', 'cabrito', 'jovem', '< 1 ano', '<1 ano'];
    return termosFilhote.some(termo => str.includes(termo));
  }

  isMae(animal: Animal): boolean {
    const sexo = (animal.sexo || '').trim().toUpperCase();
    const isFemea = sexo === 'FEMEA' || sexo === 'FÊMEA';
    return isFemea && !this.isFilhote(animal);
  }

  isVacinado(animal: Animal): boolean {
    const condicao = (animal.condicaoSaude || '').toLowerCase();
    if (condicao.includes('vacinad') || condicao.includes('imunizad')) {
      return true;
    }
    if (animal.id && this.animaisVacinadosIds.has(animal.id)) {
      return true;
    }
    return false;
  }

  get animaisFiltrados(): Animal[] {
    let lista = this.animais;

    // Filtro pelas abas de status
    if (this.abaAtiva === 'Em Tratamento') {
      lista = lista.filter(a => (a.condicaoSaude || '').toLowerCase() === 'em tratamento');
    } else if (this.abaAtiva === 'Mães') {
      lista = lista.filter(a => this.isMae(a));
    } else if (this.abaAtiva === 'Filhotes') {
      lista = lista.filter(a => this.isFilhote(a));
    } else if (this.abaAtiva === 'Vacinados') {
      lista = lista.filter(a => this.isVacinado(a));
    }

    const termo = this.termoPesquisa.trim().toLowerCase();
    if (!termo) {
      return lista;
    }

    return lista.filter(animal => {
      const codigo = (animal.codigoIdentificacao || '').toLowerCase();
      const raca = (animal.raca || '').toLowerCase();
      const especie = (animal.especie || '').toLowerCase();
      const sexo = (animal.sexo || '').toLowerCase();
      const condicao = (animal.condicaoSaude || '').toLowerCase();
      const dataOriginal = (animal.dataNascimentoOuIdade || '').toLowerCase();

      // Formata data ISO para dd/MM/yyyy para permitir busca no formato brasileiro
      let dataFormatada = '';
      if (animal.dataNascimentoOuIdade && !isNaN(Date.parse(animal.dataNascimentoOuIdade))) {
        const d = new Date(animal.dataNascimentoOuIdade);
        const dia = String(d.getUTCDate()).padStart(2, '0');
        const mes = String(d.getUTCMonth() + 1).padStart(2, '0');
        const ano = d.getUTCFullYear();
        dataFormatada = `${dia}/${mes}/${ano}`;
      }

      // Mapeia termos comuns como 'fêmea' ou 'macho'
      const sexoFormatado = sexo === 'femea' ? 'fêmea' : sexo;

      return codigo.includes(termo) ||
             raca.includes(termo) ||
             especie.includes(termo) ||
             sexo.includes(termo) ||
             sexoFormatado.includes(termo) ||
             condicao.includes(termo) ||
             dataOriginal.includes(termo) ||
             dataFormatada.includes(termo);
    });
  }

  // --- Lógica do Modal de Exclusão ---
  exibirModalExclusao: boolean = false;
  animalParaExclusao: Animal | null = null;

  abrirModalExclusao(animal: Animal): void {
    this.animalParaExclusao = animal;
    this.exibirModalExclusao = true;
  }

  fecharModalExclusao(): void {
    this.exibirModalExclusao = false;
    this.animalParaExclusao = null;
  }

  confirmarExclusao(): void {
    if (this.animalParaExclusao && this.animalParaExclusao.id) {
      this.animalService.excluirAnimal(this.animalParaExclusao.id).subscribe({
        next: () => {
          // Remove localmente sem precisar recarregar a lista toda
          this.animais = this.animais.filter(a => a.id !== this.animalParaExclusao?.id);
          this.fecharModalExclusao();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Erro ao excluir animal:', err);
          this.fecharModalExclusao();
          this.cdr.detectChanges();
        }
      });
    }
  }
}
