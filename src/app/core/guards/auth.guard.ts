import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { StaffRole } from '../models/staff.model';

export function authGuard(allowed: Array<StaffRole | 'platform'>): CanActivateFn {
  return () => {
    const auth = inject(AuthService);
    const router = inject(Router);
    const user = auth.currentUser();
    if (!user) {
      // If the protected area is admin-only, send to admin login. Otherwise clinic login.
      const target = allowed.length === 1 && allowed[0] === 'platform' ? '/admin/login' : '/login';
      router.navigateByUrl(target);
      return false;
    }
    const userRole: StaffRole | 'platform' = user.kind === 'platform' ? 'platform' : (user.role ?? 'compounder');
    if (!allowed.includes(userRole)) {
      router.navigateByUrl(auth.defaultRouteForCurrent());
      return false;
    }
    return true;
  };
}
