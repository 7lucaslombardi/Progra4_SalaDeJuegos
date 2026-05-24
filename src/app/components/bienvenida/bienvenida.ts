import { Component, inject } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { RouterLink } from '@angular/router';





@Component({
  selector: 'app-bienvenida',
  imports: [ RouterLink ],
  templateUrl: './bienvenida.html',
  styleUrl: './bienvenida.css',
})
export class BienvenidaComponent {

  authService = inject(AuthService);
}
