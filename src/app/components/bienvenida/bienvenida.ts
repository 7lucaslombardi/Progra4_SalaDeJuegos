import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';




@Component({
  selector: 'app-bienvenida',
  imports: [],
  templateUrl: './bienvenida.html',
  styleUrl: './bienvenida.css',
})
export class BienvenidaComponent {

  authService = inject(AuthService);
}
