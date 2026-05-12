import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const invitadoGuard: CanActivateFn = (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (authService.isAuthenticated()) {
        // Si ya está logueado, no tiene sentido que vea el Login/Registro
        // Lo mandamos a su sala de juegos
        router.navigate(['/bienvenida']);
        return false;
    }

    // Si NO está logueado, lo dejamos pasar al Login/Registro
    return true;
};