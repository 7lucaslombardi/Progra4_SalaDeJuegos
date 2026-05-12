import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { firstValueFrom, timer } from 'rxjs';


@Component({
  selector: 'app-login',
  standalone: true, // Acordate que en Angular moderno usamos standalone
  imports: [FormsModule, CommonModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  // Inyectamos nuestro servicio 
  private auth = inject(AuthService);

  private router = inject(Router);

  // ==========================================
  // ESTADO DEL FORMULARIO (Lo que el usuario tipea)
  // ==========================================
  email = '';
  password = '';

  // ==========================================
  // ESTADO DE LA INTERFAZ (Signals)
  // ==========================================
  // Controla si se muestra el spinner de "Cargando..."
  loading = signal(false);
  // Controla el mensaje de error rojo que le mostramos al usuario
  errorMensaje = signal('');

  // Controla el mensaje de login exitoso
  mensajeExitoso = signal('');

  // ==========================================
  // REQUISITO DEL SPRINT 2: Accesos Rápidos
  // ==========================================
  // Estos son los 3 usuarios obligatorios para que el profe corrija rápido
  usuariosTest = [
    { email: 'jugador1@mail.com', password: 'jugador1', label: 'Jugador 1' },
    { email: 'jugador2@mail.com', password: 'jugador2', label: 'Jugador 2' },
    { email: 'jugador3@mail.com', password: 'jugador2', label: 'Jugador 3' },
  ];

  // ==========================================
  // MÉTODO PRINCIPAL: Cuando el usuario aprieta "Ingresar"
  // ==========================================
  async onSubmit() {
    // 1. Mini validación: No dejamos que mande el formulario vacío
    if (!this.email || !this.password) {
      this.errorMensaje.set('Es necesario completar todos los campos.');
      return; // Cortamos la ejecución acá mismo
    }

    // 2. Prendemos el spinner y limpiamos cualquier error viejo
    this.loading.set(true);
    this.errorMensaje.set('');

    // 3. Llamamos al servicio (Fijate que ya no hay try...catch)
    // Nos va a devolver 'true' si entró, o 'false' si falló.
    const loginCorrecto = await this.auth.login(this.email, this.password);

    if (loginCorrecto) {
      this.loading.set(false);
      this.mensajeExitoso.set('¡Login exitoso! ');

      //  Hacemos la pausa de 2 segundos para que el usuario disfrute su éxito
      await firstValueFrom(timer(2000));
      
      //  Lo mandamos directo a la pantalla principal
      this.router.navigate(['/bienvenida']);
    }

    else {
      // Si devolvió false, mostramos el error y apagamos el spinner
      this.errorMensaje.set('Credenciales incorrectas o usuario no registrado.');
      this.loading.set(false);
    }
    // Nota: Si loginCorrecto es true, no hacemos nada más. El AuthService
    // ya se encarga de redirigirnos a la pantalla '/bienvenida' automáticamente.
  }

  // ==========================================
  // Metodo para iniciar sesion con los usuarios de prueba
  // ==========================================
  loginTest(mailTest: string, passwordTest: string) {
    // Cuando se hace clic en un botón, rellenamos las variables...
    this.email = mailTest;
    this.password = passwordTest;

    // ...y simulamos que apretó el botón "Ingresar" del formulario
    this.onSubmit();
  }

  // Ojito de password oculto para mostrar la contraseña en el formulario
  mostrarPassword = signal(false);
  habilitarPassword() {
    this.mostrarPassword.set(!this.mostrarPassword());
  }
}