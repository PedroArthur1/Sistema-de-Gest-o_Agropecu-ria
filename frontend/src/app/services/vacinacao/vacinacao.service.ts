import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Vacinacao, VacinacaoRequest } from '../../models/vacinacao.model';

@Injectable({
  providedIn: 'root'
})
export class VacinacaoService {
  private storageKey = 'vacinacoes_mock_db';

  constructor() {}

  private getVacinacoes(): Vacinacao[] {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }

  private saveVacinacoes(vacinacoes: Vacinacao[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(vacinacoes));
  }

  registrar(animalId: number, vacinacao: VacinacaoRequest): Observable<Vacinacao> {
    const vacinacoes = this.getVacinacoes();
    const novaVacinacao: Vacinacao = {
      id: new Date().getTime(),
      animalId,
      ...vacinacao
    };
    vacinacoes.push(novaVacinacao);
    this.saveVacinacoes(vacinacoes);
    return of(novaVacinacao);
  }

  listarHistorico(animalId: number): Observable<Vacinacao[]> {
    const vacinacoes = this.getVacinacoes().filter(v => v.animalId === animalId);
    return of(vacinacoes);
  }

  listarProximasDoses(animalId: number): Observable<Vacinacao[]> {
    const hoje = new Date().toISOString().split('T')[0];
    const vacinacoes = this.getVacinacoes().filter(v => v.animalId === animalId && v.dataProximaDose >= hoje);
    return of(vacinacoes);
  }
}
