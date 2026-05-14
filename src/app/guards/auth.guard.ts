// auth.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';


export const authGuard: CanActivateFn = async (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    await authService.sesionActiva; // ← espera a que Supabase responda

    if (authService.isAuthenticated()) {
        return true; // Si está logueado, permite pasar
    }

    // Si no está logueado, lo manda al login
    router.navigate(['/login']);
    return false;
};