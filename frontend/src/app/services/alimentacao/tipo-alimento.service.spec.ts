import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TipoAlimentoService } from './tipo-alimento.service';
import { environment } from '../../../environments/environment';
import { TipoAlimento } from '../../models/tipo-alimento.model';

describe('TipoAlimentoService', () => {
  let service: TipoAlimentoService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/tipos-alimento`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TipoAlimentoService]
    });
    service = TestBed.inject(TipoAlimentoService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve listar tipos de alimento', () => {
    const mockTipos: TipoAlimento[] = [{ id: 1, nome: 'Silagem' }];

    service.listarTiposAlimento().subscribe(tipos => {
      expect(tipos.length).toBe(1);
      expect(tipos).toEqual(mockTipos);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockTipos);
  });

  it('deve criar um tipo de alimento', () => {
    const novoTipo: TipoAlimento = { nome: 'Ração' };
    const respostaMock: TipoAlimento = { id: 2, nome: 'Ração' };

    service.criarTipoAlimento(novoTipo).subscribe(tipo => {
      expect(tipo).toEqual(respostaMock);
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(novoTipo);
    req.flush(respostaMock);
  });

  it('deve excluir um tipo de alimento', () => {
    service.excluirTipoAlimento(1).subscribe(res => {
      expect(res).toBeNull();
    });

    const req = httpMock.expectOne(`${apiUrl}/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });
});
