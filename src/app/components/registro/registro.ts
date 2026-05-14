import { Component, inject, signal } from '@angular/core';
import { AuthService } from '../../services/auth.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom, timer } from 'rxjs';


@Component({
  selector: 'app-registro',
  imports: [ReactiveFormsModule, CommonModule, RouterLink],
  templateUrl: './registro.html',
  styleUrl: './registro.css',
})
export class RegistroComponent {

  // Inyectamos nuestro servicio
  private authService = inject(AuthService);
  private router = inject(Router);

  private fb = inject(FormBuilder);

  // ==========================================
  // ESTADO DEL FORMULARIO REACTIVO
  // ==========================================
  registroForm = this.fb.group({
    nombre: ['', [Validators.required]],
    apellido: ['', [Validators.required]],
    // Validamos que la edad sea un número y esté entre 1 y 100
    edad: ['', [Validators.required, Validators.min(1), Validators.max(100)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]]
  });


  // ==========================================
  // ESTADO DE LA INTERFAZ (Signals)
  // ==========================================
  // Controla si se muestra el spinner de "Cargando..."
  loading = signal(false);
  // Controla el mensaje de error rojo que le mostramos al usuario
  errorMensaje = signal('');

  // Controla el mensaje de registro exitoso
  mensajeExitoso = signal('');


  // ==========================================
  // MÉTODO PRINCIPAL: Cuando el usuario aprieta "Ingresar"
  // ==========================================
  async onSubmit() {
    // 1. Si el formulario no cumple las validaciones, cortamos la ejecución
    if (this.registroForm.invalid) {
      this.errorMensaje.set('Por favor, revisa los campos en rojo.');
      this.registroForm.markAllAsTouched(); // Para que salten los errores visuales
      return;
    }

    // 2. Prendemos el spinner y limpiamos cualquier error viejo
    this.loading.set(true);
    this.errorMensaje.set('');

    // Extraemos los valores de forma segura
    const { email, password, nombre, apellido, edad } = this.registroForm.value;

    // 3. Llamamos al servicio
    const success = await this.authService.crearUsuario(
      {
        correo: email as string,
        nombre: nombre as string,
        apellido: apellido as string,
        edad: Number(edad), // Aseguramos que pase como número
      },
      password as string
    );
    if (success) {
      // 2. ¡ÉXITO! Apagamos el spinner rojo de error y mostramos la alerta verde
      this.mensajeExitoso.set('¡Usuario creado con exito! ');

      // 3. Hacemos la pausa de 2 segundos para que el usuario disfrute su éxito
      await firstValueFrom(timer(2000));
      this.loading.set(false);

      // 4. Recién ahora, ejecutamos el login (y el login sí nos lleva al /home)
      await this.authService.login(email as string, password as string);
      // Redirigimos a la pantalla de Login
      this.router.navigate(['/bienvenida']);
    }
    else {
      this.errorMensaje.set('No se pudo registrar el usuario:' + ' ' + this.authService.errorMensaje());
      this.loading.set(false); // Desactivamos el spinner si falló.
    }
    // Nota: Si success es true el AuthService ya se encarga de redirigirnos a la pantalla '/bienvenida' automáticamente.
  }


}
