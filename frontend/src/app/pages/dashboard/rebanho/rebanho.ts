import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AnimalService } from '../../../services/animal/animal.service';
import { Animal } from '../../../models/animal.model';

@Component({
  selector: 'app-rebanho',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './rebanho.html',
  styleUrl: './rebanho.css',
})
export class Rebanho implements OnInit {
  animais: Animal[] = []; 
  termoPesquisa: string = '';
  
  abas = ['Todos os Animais', 'Vacinados', 'Em Tratamento', 'Mães', 'Filhotes'];
  abaAtiva = 'Todos os Animais';

  constructor(private animalService: AnimalService) {}

  ngOnInit(): void {
    this.carregarAnimais();
  }

  carregarAnimais(): void {
    this.animalService.listarAnimais().subscribe({
      next: (dados) => {
        this.animais = dados ?? [];
      },
      error: (err) => {
        console.error('Erro ao carregar animais:', err);
      }
    });
  }

  limparPesquisa(): void {
    this.termoPesquisa = '';
  }

  get animaisFiltrados(): Animal[] {
    let lista = this.animais;

    // Filtro pelas abas de status
    if (this.abaAtiva === 'Em Tratamento') {
      lista = lista.filter(a => (a.condicaoSaude || '').toLowerCase() === 'em tratamento');
    } else if (this.abaAtiva === 'Mães') {
      lista = lista.filter(a => (a.sexo || '').toUpperCase() === 'FEMEA');
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
}

