import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { AuthService } from './auth.service';
import { getBrowserStorage } from '../../utils/browser-storage';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let storage: Storage;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    storage = getBrowserStorage();
    storage.clear();
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('deve ser criado', () => {
    expect(service).toBeTruthy();
  });

  it('deve salvar o token, a role e o nome no localStorage ao fazer login com sucesso', () => {
    const mockResponse = { token: 'fake-jwt-token', role: 'ADMIN', nome: 'João Silva' };
    const mockCredentials = { email: 'admin@teste.com', password: '123' };

    // Chama o método de login
    service.login(mockCredentials).subscribe();

    const req = httpMock.expectOne('http://localhost:8080/auth/login');
    expect(req.request.method).toBe('POST');
    req.flush(mockResponse);

    expect(storage.getItem('jwt_token')).toBe('fake-jwt-token');
    expect(storage.getItem('user_role')).toBe('ADMIN');
    expect(storage.getItem('user_name')).toBe('João Silva');
  });

  it('deve limpar o localStorage ao fazer logout', () => {
    storage.setItem('jwt_token', 'fake-jwt-token');
    storage.setItem('user_role', 'ADMIN');
    storage.setItem('user_name', 'João Silva');

    service.logout();

    expect(storage.getItem('jwt_token')).toBeNull();
    expect(storage.getItem('user_role')).toBeNull();
    expect(storage.getItem('user_name')).toBeNull();
  });

  it('isLoggedIn deve retornar true se houver um token', () => {
    storage.setItem('jwt_token', 'fake-jwt-token');

    expect(service.isLoggedIn()).toBe(true);
  });
});
