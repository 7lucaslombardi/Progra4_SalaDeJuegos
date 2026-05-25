import { Injectable, inject, signal, NgZone } from '@angular/core';
import { AuthService } from './auth.service'; // Ajustá la ruta real a tu servicio de Auth
import { SupabaseService } from './supabase.service'; // Ajustá la ruta real a tu servicio de Supabase
import { RegistroResultados, DetallesPartida } from '../models/user.models';


@Injectable({ providedIn: 'root' })
export class RegistrosService {

  private supabase = inject(SupabaseService).getCliente();
  private authService = inject(AuthService);

  // Signal reactivo para leer las marcas en las tablas de posiciones (Rankings)
  public rankings = signal<RegistroResultados[]>([]);

  /**
   * Registra el resultado transaccional de cualquier juego en la tabla única de Supabase.
   * Transforma el objeto de detalles libres en string automáticamente mediante JSON.stringify.
   */
  async guardarResultado(
    juego: 'AHORCADO' | 'MAYOR-O-MENOR' | 'PREGUNTADOS' | 'CLICK-THE-CIRCLE',
    puntaje: number,
    resultado: boolean,
    tiempo_de_partida: number,
    descripcion: DetallesPartida
  ): Promise<boolean> {
    const usuarioLogueado = this.authService.user();
    if (!usuarioLogueado) return false;

    // Hacemos el insert 
    const { error } = await this.supabase
      .from('Registros')
      .insert({
        user_id: usuarioLogueado.id,
        juego,
        puntaje,
        resultado,
        tiempo_de_partida,
        descripcion,
        jugador_nombre: usuarioLogueado.nombre + " " + usuarioLogueado.apellido
      });

    // Si la variable error tiene algo adentro, falló. Lo mostramos y devolvemos false.
    if (error) {
      console.error("Error al guardar en Supabase:", error);
      return false;
    }

    // Si llegamos hasta acá, significa que error es null. Se guardó bien
    return true;
  }

  async obtenerResultados(): Promise<RegistroResultados[]> {
    try {

      const { data, error } = await this.supabase
        .from('Registros')
        .select('*');

      if (error) {
        console.error('Error al traer los datos de Supabase:', error.message);
        return []; // Si falla, devolvemos un array vacío para que la página no explote
      }

      // Devolvemos los datos asegurando que respetan nuestra interfaz
      return data as RegistroResultados[];

    } catch (err) {
      console.error('Error inesperado en el servicio:', err);
      return [];
    }
  }

}


