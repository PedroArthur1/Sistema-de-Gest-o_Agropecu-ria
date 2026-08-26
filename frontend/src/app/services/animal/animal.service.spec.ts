import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { AnimalService } from './animal.service';
import { Animal } from '../../models/animal.model';

describe('AnimalService', () => {
  let servico: AnimalService;
  let simuladorHttp: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    const http = TestBed.inject(HttpClient);
    servico = new AnimalService(http);
    simuladorHttp = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    simuladorHttp.verify();
  });

  it('deve criar o serviço de animais', () => {
    expect(servico).toBeTruthy();
  });

  it('deve enviar requisição POST para cadastrar animal', () => {
    const animalExemplo: Animal = {
      codigoIdentificacao: 'BOV-001',
      especie: 'Bovino',
      raca: 'Nelore',
      sexo: 'MACHO',
      dataNascimentoOuIdade: '2023-01-15',
      peso: 450.5,
      condicaoSaude: 'Excelente'
    };

    servico.cadastrarAnimal(animalExemplo).subscribe((resposta) => {
      expect(resposta).toEqual({ ...animalExemplo, id: 1 });
    });

    const requisicao = simuladorHttp.expectOne(req => req.url.startsWith('http://localhost:8080/animais'));
    expect(requisicao.request.method).toBe('POST');
    expect(requisicao.request.body).toEqual(animalExemplo);

    requisicao.flush({ ...animalExemplo, id: 1 });
  });

  it('deve enviar requisição GET para listar animais', () => {
    const listaExemplo: Animal[] = [
      {
        id: 1,
        codigoIdentificacao: 'BOV-001',
        especie: 'Bovino',
        raca: 'Nelore',
        sexo: 'MACHO',
        dataNascimentoOuIdade: '2 anos',
        peso: 450,
        condicaoSaude: 'Boa'
      }
    ];

    servico.listarAnimais().subscribe((animais) => {
      expect(animais.length).toBe(1);
      expect(animais).toEqual(listaExemplo);
    });

    const requisicao = simuladorHttp.expectOne((req) => req.url.startsWith('http://localhost:8080/animais') && req.method === 'GET');
    expect(requisicao.request.method).toBe('GET');
    requisicao.flush(listaExemplo);
  });

  it('deve enviar requisição PUT para atualizar animal', () => {
    const animalEdicao: Animal = {
      id: 1,
      codigoIdentificacao: 'BOV-001',
      especie: 'Bovino',
      raca: 'Angus',
      sexo: 'MACHO',
      dataNascimentoOuIdade: '3 anos',
      peso: 500,
      condicaoSaude: 'Em Tratamento'
    };

    servico.atualizarAnimal(1, animalEdicao).subscribe((resposta) => {
      expect(resposta).toEqual(animalEdicao);
    });

    const requisicao = simuladorHttp.expectOne('http://localhost:8080/animais/1');
    expect(requisicao.request.method).toBe('PUT');
    expect(requisicao.request.body).toEqual(animalEdicao);
    requisicao.flush(animalEdicao);
  });
});
