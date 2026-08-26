import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { VacinacaoService } from './vacinacao.service';
import { Vacinacao, VacinacaoRequest } from '../../models/vacinacao.model';

describe('VacinacaoService', () => {
  let servico: VacinacaoService;
  let simuladorHttp: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    const http = TestBed.inject(HttpClient);
    servico = new VacinacaoService(http);
    simuladorHttp = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    simuladorHttp.verify();
  });

  it('deve criar o serviço de vacinação', () => {
    expect(servico).toBeTruthy();
  });

  it('deve enviar requisição POST para registrar vacinação do animal', () => {
    const requisicao: VacinacaoRequest = {
      nomeVacina: 'Febre Aftosa',
      dataAplicacao: '2026-08-12',
      dose: '5 mL',
      responsavel: 'Dr. João Veterinário',
      dataProximaDose: '2026-11-12'
    };

    const resposta: Vacinacao = { id: 1, animalId: 10, ...requisicao };

    servico.registrar(10, requisicao).subscribe((resultado) => {
      expect(resultado).toEqual(resposta);
    });

    const chamada = simuladorHttp.expectOne('http://localhost:8080/animais/10/vacinacoes');
    expect(chamada.request.method).toBe('POST');
    expect(chamada.request.body).toEqual(requisicao);
    chamada.flush(resposta);
  });

  it('deve enviar requisição GET para consultar o histórico de vacinação', () => {
    const historico: Vacinacao[] = [
      {
        id: 2,
        animalId: 10,
        nomeVacina: 'Febre Aftosa',
        dataAplicacao: '2026-08-12',
        dose: '5 mL',
        responsavel: 'Dr. João Veterinário',
        dataProximaDose: '2026-11-12'
      }
    ];

    servico.listarHistorico(10).subscribe((resultado) => {
      expect(resultado).toEqual(historico);
    });

    const chamada = simuladorHttp.expectOne('http://localhost:8080/animais/10/vacinacoes');
    expect(chamada.request.method).toBe('GET');
    chamada.flush(historico);
  });
});
