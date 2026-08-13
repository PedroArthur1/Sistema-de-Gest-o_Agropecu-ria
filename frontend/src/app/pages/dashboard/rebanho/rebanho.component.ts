import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CabecalhoPaginaComponent } from '../../../components/cabecalho-pagina/cabecalho-pagina.component';
import { BotaoAcaoComponent } from '../../../components/botao-acao/botao-acao.component';

@Component({
  selector: 'app-rebanho',
  standalone: true,
  imports: [CommonModule, RouterLink, CabecalhoPaginaComponent, BotaoAcaoComponent],
  templateUrl: './rebanho.component.html',
  styleUrl: './rebanho.component.css'
})
export class RebanhoComponent {}
