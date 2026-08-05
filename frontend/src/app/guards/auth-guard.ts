import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isLoggedIn()) {
    const expectedRole = route.data['role'];
    const userRole = authService.getRole();

    if (expectedRole && userRole !== expectedRole) {
      router.navigate(['/dashboard']);
      return false;
    }
    return true;
  }

  router.navigate(['/login']);
  return false;
};