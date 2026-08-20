import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LembreteVacinacaoService } from '../../../../services/vacinacao/lembrete-vacinacao.service';
import { Lembrete } from '../../../../models/lembrete.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-lembretes-vacinacao',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './lembretes-vacinacao.html',
  styleUrl: './lembretes-vacinacao.css'
})
export class LembretesVacinacaoComponent implements OnInit {

  lembretes$!: Observable<Lembrete[]>;

  constructor(private lembreteService: LembreteVacinacaoService) {}

  ngOnInit(): void {
    this.lembretes$ = this.lembreteService.getLembretes();
  }

  getBadgeClass(status: string): string {
    switch (status) {
      case 'Atrasada': return 'badge-atrasada';
      case 'Hoje': return 'badge-hoje';
      default: return 'badge-proxima';
    }
  }
}
