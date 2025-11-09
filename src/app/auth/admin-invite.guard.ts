import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { map } from 'rxjs/operators';

export const AdminInviteGuard = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Authorized emails for user invitation
  const AUTHORIZED_EMAILS = [
    'stephen.cantoria@stjo.farm',
    'jolene.cantoria@stjo.farm'
  ];

  return authService.currentUser$.pipe(
    map(user => {
      if (user && AUTHORIZED_EMAILS.includes(user.email || '')) {
        return true;
      } else {
        router.navigate(['/']);
        return false;
      }
    })
  );
};
