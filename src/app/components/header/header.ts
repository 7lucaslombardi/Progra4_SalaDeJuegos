import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service'; // Ajusta la ruta a tu servicio
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './header.html',
  styleUrls: ['./header.css']
})
export class HeaderComponent {
  authService = inject(AuthService); // Inyección del servicio
}
