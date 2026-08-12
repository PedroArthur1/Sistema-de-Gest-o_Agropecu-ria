import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AnimalService } from '../../services/animal/animal.service';
import { AlertaMensagemComponent } from '../../components/alerta-mensagem/alerta-mensagem.component';
import { CabecalhoPaginaComponent } from '../../components/cabecalho-pagina/cabecalho-pagina.component';
import { CampoFormularioComponent } from '../../components/campo-formulario/campo-formulario.component';
import { BotaoAcaoComponent } from '../../components/botao-acao/botao-acao.component';

@Component({
  selector: 'app-animal-cadastro',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    AlertaMensagemComponent,
    CabecalhoPaginaComponent,
    CampoFormularioComponent,
    BotaoAcaoComponent
  ],
  templateUrl: './animal-cadastro.component.html',
  styleUrl: './animal-cadastro.component.css'
})
export class AnimalCadastroComponent {
  formularioAnimal: FormGroup;

  mensagemSucesso: string = '';
  mensagemErro: string = '';
  estaEnviando: boolean = false;

  especiesDisponiveis: string[] = ['Bovino', 'Ovino', 'Caprino', 'Suíno', 'Equino', 'Outro'];
  condicoesSaude: string[] = ['Excelente', 'Boa', 'Em Observação', 'Tratamento'];

  constructor(
    private construtorFormulario: FormBuilder,
    private servicoAnimal: AnimalService,
    private roteador: Router
  ) {
    // Inicialização e regras de validação do formulário
    this.formularioAnimal = this.construtorFormulario.group({
      codigoIdentificacao: ['', [Validators.required, Validators.minLength(2)]],
      especie: ['', [Validators.required]],
      raca: ['', [Validators.required]],
      sexo: ['', [Validators.required]],
      dataNascimentoOuIdade: ['', [Validators.required]],
      peso: ['', [Validators.required, Validators.min(0.1)]],
      condicaoSaude: ['', [Validators.required]],
      observacoes: ['']
    });
  }

  campoInvalido(nomeCampo: string): boolean {
    const campo = this.formularioAnimal.get(nomeCampo);
    return !!(campo && campo.invalid && (campo.dirty || campo.touched || this.estaEnviando));
  }

  // Processamento do cadastro
  cadastrar(): void {
    this.estaEnviando = true;
    this.mensagemSucesso = '';
    this.mensagemErro = '';

    if (this.formularioAnimal.invalid) {
      this.formularioAnimal.markAllAsTouched();
      this.mensagemErro = 'Por favor, preencha todos os campos obrigatórios corretamente.';
      this.estaEnviando = false;
      return;
    }

    this.servicoAnimal.cadastrarAnimal(this.formularioAnimal.value).subscribe({
      next: (resposta) => {
        const codigo = resposta.codigoIdentificacao || this.formularioAnimal.value.codigoIdentificacao;
        this.mensagemSucesso = `Animal '${codigo}' cadastrado com sucesso!`;
        this.formularioAnimal.reset();
        this.estaEnviando = false;
      },
      error: (erro) => {
        this.mensagemErro = erro.error?.message || 'Erro ao cadastrar animal. Verifique os dados e tente novamente.';
        this.estaEnviando = false;
      }
    });
  }

  voltar(): void {
    this.roteador.navigate(['/dashboard']);
  }
}
