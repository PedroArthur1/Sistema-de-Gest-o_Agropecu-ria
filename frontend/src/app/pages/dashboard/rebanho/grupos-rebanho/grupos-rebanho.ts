import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GrupoRebanhoService } from '../../../../services/rebanho/grupo-rebanho.service';
import { GrupoRebanho } from '../../../../models/grupo-rebanho.model';

@Component({
  selector: 'app-grupos-rebanho',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './grupos-rebanho.html',
  styleUrl: './grupos-rebanho.css'
})
export class GruposRebanhoComponent implements OnInit {
  grupos: GrupoRebanho[] = [];
  
  exibirModal: boolean = false;
  isEditando: boolean = false;
  
  grupoForm: Partial<GrupoRebanho> = {
    nome: '',
    descricao: ''
  };

  exibirModalExclusao: boolean = false;
  grupoParaExclusao: GrupoRebanho | null = null;
  erroMensagem: string = '';

  constructor(
    private grupoService: GrupoRebanhoService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.carregarGrupos();
  }

  carregarGrupos(): void {
    this.grupoService.listarGrupos().subscribe({
      next: (dados) => {
        this.grupos = dados || [];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Erro ao listar grupos:', err)
    });
  }

  abrirModalNovo(): void {
    this.isEditando = false;
    this.erroMensagem = '';
    this.grupoForm = { nome: '', descricao: '' };
    this.exibirModal = true;
  }

  abrirModalEditar(grupo: GrupoRebanho): void {
    this.isEditando = true;
    this.erroMensagem = '';
    this.grupoForm = { ...grupo };
    this.exibirModal = true;
  }

  fecharModal(): void {
    this.exibirModal = false;
    this.grupoForm = { nome: '', descricao: '' };
    this.erroMensagem = '';
  }

  salvarGrupo(): void {
    if (!this.grupoForm.nome?.trim()) {
      this.erroMensagem = 'O nome do lote é obrigatório.';
      return;
    }

    if (this.isEditando && this.grupoForm.id) {
      this.grupoService.atualizarGrupo(this.grupoForm.id, this.grupoForm).subscribe({
        next: (grupoSalvo) => {
          const index = this.grupos.findIndex(g => g.id === grupoSalvo.id);
          if (index !== -1) {
            this.grupos[index] = grupoSalvo;
          }
          this.fecharModal();
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.erroMensagem = err.error?.message || 'Erro ao atualizar grupo.';
          this.cdr.detectChanges();
        }
      });
    } else {
      this.grupoService.criarGrupo(this.grupoForm).subscribe({
        next: (grupoSalvo) => {
          this.grupos.push(grupoSalvo);
          this.fecharModal();
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.erroMensagem = err.error?.message || 'Erro ao criar grupo.';
          this.cdr.detectChanges();
        }
      });
    }
  }

  abrirModalExclusao(grupo: GrupoRebanho): void {
    this.grupoParaExclusao = grupo;
    this.exibirModalExclusao = true;
  }

  fecharModalExclusao(): void {
    this.exibirModalExclusao = false;
    this.grupoParaExclusao = null;
  }

  confirmarExclusao(): void {
    if (this.grupoParaExclusao?.id) {
      this.grupoService.excluirGrupo(this.grupoParaExclusao.id).subscribe({
        next: () => {
          this.grupos = this.grupos.filter(g => g.id !== this.grupoParaExclusao!.id);
          this.fecharModalExclusao();
          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Erro ao excluir:', err);
          this.fecharModalExclusao();
          // Aqui poderia exibir um toast de erro
        }
      });
    }
  }
}
