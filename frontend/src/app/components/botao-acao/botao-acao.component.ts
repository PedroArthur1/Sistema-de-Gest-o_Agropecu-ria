import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-botao-acao',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './botao-acao.component.html',
  styleUrl: './botao-acao.component.css'
})
export class BotaoAcaoComponent {
  @Input() texto: string = '';
  @Input() tipo: 'primario' | 'cancelar' = 'primario';
  @Input() desabilitado: boolean = false;
  @Input() tipoSubmit: boolean = false;
  @Output() aoClicar = new EventEmitter<void>();

  onClick(): void {
    if (!this.desabilitado) {
      this.aoClicar.emit();
    }
  }
}
