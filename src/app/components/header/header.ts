import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service'; // Ajusta la ruta a tu servicio
import { RouterLink, RouterLinkActive, Router } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class HeaderComponent {
  authService = inject(AuthService); // Inyección del servicio

  router = inject(Router);


  // Creamos un método que devuelve TRUE si estamos en Login o Registro
  validacionRuta(): boolean {
    return this.router.url.includes('/registro') || this.router.url.includes('/login') ;
  }
}

