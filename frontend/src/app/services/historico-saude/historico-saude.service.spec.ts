import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { HistoricoSaudeService } from './historico-saude.service';
import { HistoricoSaudeResumo } from '../../models/historico-saude.model';

describe('HistoricoSaudeService', () => {
  let servico: HistoricoSaudeService;
  let simuladorHttp: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    const http = TestBed.inject(HttpClient);
    servico = new HistoricoSaudeService(http);
    simuladorHttp = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    simuladorHttp.verify();
  });

  it('deve criar o serviço de histórico de saúde', () => {
    expect(servico).toBeTruthy();
  });

  it('deve enviar requisição GET para buscar histórico consolidado do animal', () => {
    const resumoMock: HistoricoSaudeResumo = {
      animalId: 1,
      codigoAnimal: 'BOV-001',
      totalEventos: 2,
      totalVacinas: 1,
      totalTratamentos: 1,
      totalConsultas: 0,
      eventos: [
        {
          idOrigem: 1,
          tipo: 'TRATAMENTO',
          data: '2026-08-20',
          titulo: 'Antibiótico',
          subtitulo: 'Motivo: Febre',
          descricao: 'Dosagem: 5ml',
          responsavel: 'Dr. Silva'
        },
        {
          idOrigem: 2,
          tipo: 'VACINACAO',
          data: '2026-08-10',
          titulo: 'Febre Aftosa',
          subtitulo: 'Dose: 1ª dose',
          responsavel: 'Carlos'
        }
      ]
    };

    servico.buscarHistoricoConsolidado(1).subscribe((resposta) => {
      expect(resposta).toEqual(resumoMock);
      expect(resposta.totalEventos).toBe(2);
      expect(resposta.eventos[0].tipo).toBe('TRATAMENTO');
    });

    const requisicao = simuladorHttp.expectOne(req => req.url.startsWith('http://localhost:8080/animais/1/historico-saude') && req.method === 'GET');
    expect(requisicao.request.method).toBe('GET');
    requisicao.flush(resumoMock);
  });
});
