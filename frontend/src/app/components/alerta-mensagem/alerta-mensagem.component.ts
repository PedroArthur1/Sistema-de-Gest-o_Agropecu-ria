import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-alerta-mensagem',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alerta-mensagem.component.html',
  styleUrl: './alerta-mensagem.component.css'
})
export class AlertaMensagemComponent {
  @Input() mensagem: string = '';
  @Input() tipo: 'sucesso' | 'erro' = 'sucesso';
}
