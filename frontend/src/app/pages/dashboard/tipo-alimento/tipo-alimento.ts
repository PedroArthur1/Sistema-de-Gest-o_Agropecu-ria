import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TipoAlimentoService } from '../../../services/alimentacao/tipo-alimento.service';
import { TipoAlimento } from '../../../models/tipo-alimento.model';
import { RouterLink } from '@angular/router';
import { CabecalhoPaginaComponent } from '../../../components/cabecalho-pagina/cabecalho-pagina.component';
import { BotaoAcaoComponent } from '../../../components/botao-acao/botao-acao.component';

@Component({
  selector: 'app-tipo-alimento',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    CabecalhoPaginaComponent,
    BotaoAcaoComponent
  ],
  templateUrl: './tipo-alimento.html',
  styleUrls: ['./tipo-alimento.css']
})
export class TipoAlimentoComponent implements OnInit {
  tipoAlimentoForm!: FormGroup;
  tiposAlimento: TipoAlimento[] = [];
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private tipoAlimentoService: TipoAlimentoService
  ) {}

  ngOnInit(): void {
    this.tipoAlimentoForm = this.fb.group({
      nome: ['', Validators.required],
      descricao: ['']
    });

    this.carregarTipos();
  }

  carregarTipos(): void {
    this.tipoAlimentoService.listarTiposAlimento().subscribe({
      next: (dados) => this.tiposAlimento = dados,
      error: (err) => console.error('Erro ao carregar tipos de alimento', err)
    });
  }

  salvarTipoAlimento(): void {
    if (this.tipoAlimentoForm.valid) {
      this.isSubmitting = true;
      this.tipoAlimentoService.criarTipoAlimento(this.tipoAlimentoForm.value).subscribe({
        next: (novoTipo) => {
          this.tiposAlimento.push(novoTipo);
          this.tipoAlimentoForm.reset();
          this.isSubmitting = false;
        },
        error: (err) => {
          console.error('Erro ao salvar tipo de alimento', err);
          this.isSubmitting = false;
        }
      });
    }
  }

  excluirTipoAlimento(id: number): void {
    this.tipoAlimentoService.excluirTipoAlimento(id).subscribe({
      next: () => {
        this.tiposAlimento = this.tiposAlimento.filter(t => t.id !== id);
      },
      error: (err) => {
        console.error('Erro ao deletar tipo de alimento', err);
        alert('Não foi possível excluir. É provável que este alimento já esteja sendo usado no histórico.');
      }
    });
  }
}
