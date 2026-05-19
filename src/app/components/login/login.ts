import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { firstValueFrom, timer } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  // IMPORTANTE: Se reemplaza FormsModule por ReactiveFormsModule
  imports: [ReactiveFormsModule, CommonModule, RouterLink], 
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  
  // Inyectamos el FormBuilder de Angular
  private fb = inject(FormBuilder);

  // ==========================================
  // ESTADO DEL FORMULARIO REACTIVO
  // ==========================================
  loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]] 
  });

  // Signals para la interfaz
  loading = signal(false);
  errorMensaje = signal('');
  mensajeExitoso = signal('');

  // Usuarios de prueba
  usuariosTest = [
    { email: 'jugador1@mail.com', password: 'jugador1', label: 'Jugador 1' },
    { email: 'jugador2@mail.com', password: 'jugador2', label: 'Jugador 2' },
    { email: 'jugador3@mail.com', password: 'jugador3', label: 'Jugador 3' },
  ];

  async onSubmit() {
    // 1. Si el formulario es inválido, marcamos todo como tocado para mostrar los errores y cortamos la ejecución
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched(); 
      return; 
    }

    this.loading.set(true);
    this.errorMensaje.set('');

    // 2. Extraemos los valores del formulario de manera segura
    const { email, password } = this.loginForm.value;

    // 3. Llamamos al servicio de autenticación
    const loginCorrecto = await this.auth.login(email as string, password as string);

    if (loginCorrecto) {
      await firstValueFrom(timer(1000))
      this.mensajeExitoso.set('¡Login exitoso!');
      await firstValueFrom(timer(2000));
      this.loading.set(false);
      this.router.navigate(['/bienvenida']);
    } else {
      this.errorMensaje.set('Credenciales incorrectas o usuario no registrado.');
      this.loading.set(false);
    }
  }

  // Método para los botones de acceso rápido
  loginTest(mailTest: string, passwordTest: string) {
    // En formularios reactivos, usamos patchValue para setear datos por código
    this.loginForm.patchValue({
      email: mailTest,
      password: passwordTest
    });
  }

  // Lógica del ojito de contraseña
  mostrarPassword = signal(false);
  habilitarPassword() {
    this.mostrarPassword.set(!this.mostrarPassword());
  }
}