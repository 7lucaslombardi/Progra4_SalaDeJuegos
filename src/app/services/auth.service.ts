import { Injectable, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { SupabaseService } from './supabase.service';
import { UserSession, Usuario } from '../models/user.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // Inyectamos las herramientas que vamos a usar
  private router = inject(Router);
  private supabase = inject(SupabaseService);

  // Estado de sesion

  // Este es el Signal principal. Guarda los datos del usuario activo o 'null' si no hay nadie.
  user = signal<UserSession | null>(null);

  // Signal computado: Se actualiza solo. Devuelve 'true' si hay alguien en 'user', o 'false' si es null.
  // Ideal para ocultar/mostrar botones en el Navbar.
  isAuthenticated = computed(() => this.user() !== null);

  // Signal computado: Devuelve el nombre del usuario logueado o la palabra 'Invitado'.
  nombreUsuario = computed(() => {
    const u = this.user();

    // Si por algún motivo de carga rápida no hay usuario, devuelve vacío (el HTML igual lo oculta)
    if (!u) return '';

    return `${u.nombre} ${u.apellido}`;
  });

  // Controla el mensaje de error rojo que le mostramos al usuario
  errorMensaje = signal('');

  sesionActiva: Promise<void>;

  constructor() {
    // Guardamos la promesa para que los guards puedan esperarla
    this.sesionActiva = this.checkSession();

    this.supabase.getCliente().auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        this.cargarUsuario(session.user);
      } else {
        this.user.set(null);
      }
    });
  }

  private cargarUsuario(supabaseUser: any) {
    // Extraemos las propiedades que necesitamos usando desestructuración
    const { id, email, user_metadata } = supabaseUser;

    // Creamos un objeto de perfil con valores de respaldo 
    const perfilActualizado = {
      id: id,
      email: email ?? '',
      nombre: user_metadata?.nombre,
      apellido: user_metadata?.apellido,
      edad: Number(user_metadata?.edad)
    };

    // Actualizamos con el objeto ya procesado
    this.user.set(perfilActualizado);
  }


  // Método para que la sesión sobreviva si el usuario aprieta F5 (recarga la página)
  async checkSession() {
    // Le preguntamos a Supabase si tiene una sesión guardada en la memoria del navegador
    const { data: { session } } = await this.supabase.getCliente().auth.getSession();

    // Si la hay, restauramos los datos en nuestro Signal
    if (session?.user) {
      this.cargarUsuario(session.user);
    }
  }

  // Login
  async login(email: string, password: string): Promise<boolean> {
    // Le mandamos las credenciales a Supabase y abrimos el paquete { data, error }
    const { data, error } = await this.supabase.getCliente().auth.signInWithPassword({ email, password });

    // Si falló (contraseña incorrecta, mail no existe, etc.)
    if (error) {
      console.error('Error al iniciar sesión:', error.message);
      // Devolvemos 'false' en silencio para que el componente muestre el mensaje de error visual,
      // evitando usar "throw error" para no romper la app.
      return false;
    }

    // Si salió todo bien y Supabase nos devolvió el objeto 'user'
    if (data.user) {
      // 1. Avisamos por el megáfono que entró alguien
      this.cargarUsuario(data.user);
      // Le avisamos al componente que fue un éxito
      return true;
    }

    return false; // Por si pasa algo muy raro y no hay ni error ni usuario
  }

  // =======================================================
  // MÉTODO 2: REGISTRO 
  // =======================================================
  async crearUsuario(datosUsuario: Usuario, password: string): Promise<boolean> {

    // Llamamos a signUp enviando el correo y la clave obligatorios
    const { data, error } = await this.supabase.getCliente().auth.signUp({
      email: datosUsuario.correo,
      password: password,
      // En 'options.data' metemos nuestra "mochila" con todos los datos extra
      // Supabase los guardará automáticamente en su columna 'raw_user_meta_data'
      options: {
        data: {
          nombre: datosUsuario.nombre,
          apellido: datosUsuario.apellido,
          edad: datosUsuario.edad
        }
      }
    });

    // Si el registro falla (ej: el correo ya estaba usado)
    if (error) {
      this.errorMensaje.set(error.message)
      // Devolvemos false para que el componente actúe en consecuencia
      return false;
    }

    // Si el registro fue exitoso
    if (data.user) {
      return true;
    }

    return false;
  }


  // MÉTODO 3: LOGOUT

  async logout(): Promise<void> {
    // Le decimos a Supabase que destruya la sesión en el servidor
    await this.supabase.getCliente().auth.signOut();

    // Vaciamos nuestro Signal (null el usuario)
    this.user.set(null);

    // Redirigimos a la pantalla de Login
    this.router.navigate(['/bienvenida']);
  }
}