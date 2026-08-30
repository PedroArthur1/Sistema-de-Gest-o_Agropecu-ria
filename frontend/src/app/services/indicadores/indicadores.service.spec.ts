import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { IndicadoresService } from './indicadores.service';
import { IndicadoresRebanho } from '../../models/indicadores.model';
import { environment } from '../../../environments/environment';

describe('IndicadoresService', () => {
  let service: IndicadoresService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        IndicadoresService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(IndicadoresService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Garantir que nenhuma requisição ficou pendente
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('deve fazer GET para /animais/indicadores e retornar os dados', () => {
    const mockResponse: IndicadoresRebanho = {
      totalAnimais: 3,
      pesoMedio: 400.0,
      totalMachos: 2,
      totalFemeas: 1,
      percentualMachos: 67,
      percentualFemeas: 33,
      distribuicaoEspecie: [{ nome: 'Bovino', total: 3, percentual: 100 }],
      distribuicaoRaca:    [{ nome: 'Nelore', total: 2, percentual: 67 }],
      distribuicaoSaude:   [{ nome: 'Saudável', total: 3, percentual: 100 }],
      distribuicaoIdade:   [{ nome: 'Adulto (1-5 anos)', total: 3, percentual: 100 }]
    };

    service.buscarIndicadores().subscribe(data => {
      expect(data).toEqual(mockResponse);
      expect(data.totalAnimais).toBe(3);
      expect(data.distribuicaoEspecie.length).toBe(1);
      expect(data.distribuicaoEspecie[0].nome).toBe('Bovino');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/animais/indicadores`);
    expect(req.request.method).toBe('GET');
    req.flush(mockResponse);
  });

  it('deve usar a URL correta do environment', () => {
    service.buscarIndicadores().subscribe();

    const req = httpMock.expectOne(`${environment.apiUrl}/animais/indicadores`);
    expect(req.request.url).toContain('/animais/indicadores');
    req.flush({});
  });
});
