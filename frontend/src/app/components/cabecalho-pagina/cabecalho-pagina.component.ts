import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-cabecalho-pagina',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './cabecalho-pagina.component.html',
  styleUrl: './cabecalho-pagina.component.css'
})
export class CabecalhoPaginaComponent {
  @Input() titulo: string = '';
  @Input() subtitulo: string = '';
  @Input() icone: string = '';
}
