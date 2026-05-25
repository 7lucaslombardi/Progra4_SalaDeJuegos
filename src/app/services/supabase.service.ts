import { Injectable } from '@angular/core';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';

@Injectable({ // esta clase es un servicio que puede ser inyectado en cualquier componente
  providedIn: 'root'
})
export class SupabaseService {
  private cliente: SupabaseClient; // variable privada para guardar la conexión a Supabase

  constructor(){
    this.cliente = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  getCliente(): SupabaseClient {
    return this.cliente;
  }
}