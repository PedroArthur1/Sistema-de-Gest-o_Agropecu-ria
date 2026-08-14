import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';
import { authGuard } from './auth-guard';
import { vi } from 'vitest';

describe('authGuard', () => {
  let authMock: any;
  let routerMock: any;

  beforeEach(() => {
    authMock = {
      isLoggedIn: vi.fn(),
      getRole: vi.fn()
    };

    routerMock = {
      navigate: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authMock },
        { provide: Router, useValue: routerMock }
      ]
    });
  });

  it('deve permitir a navegação se o usuário estiver autenticado', () => {
    authMock.isLoggedIn.mockReturnValue(true);

    const result = TestBed.runInInjectionContext(() => {
      return authGuard({ data: {} } as any, {} as any);
    });

    expect(result).toBe(true);

    expect(routerMock.navigate).not.toHaveBeenCalled();
  });

  it('deve bloquear a navegação e redirecionar para o login se não estiver autenticado', () => {
    authMock.isLoggedIn.mockReturnValue(false);

    const result = TestBed.runInInjectionContext(() => {
      return authGuard({ data: {} } as any, {} as any);
    });

    expect(result).toBe(false);

    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });
});
