import { Injectable, inject, signal } from '@angular/core';
import { SupabaseService } from './supabase.service';
import { AuthService } from './auth.service'; // service del sprint 2
import { Mensaje } from '../models/user.models';


@Injectable({ providedIn: 'root' })
export class ChatService {
    private supabase = inject(SupabaseService).getCliente();
    private authService = inject(AuthService); // Inyectamos el Auth

    public mensajes = signal<Mensaje[]>([]);

    constructor() {
        this.cargarMensajesIniciales();
        this.escucharMensajesEnTiempoReal();
    }

    async cargarMensajesIniciales() {
        const { data } = await this.supabase
            .from('Chat')
            .select('*')
            .order('created_at', { ascending: true });

        if (data) this.mensajes.set(data as Mensaje[]);
    }

    escucharMensajesEnTiempoReal() {
        this.supabase
            .channel('sala-publica')
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'Chat' },
                async () => {
                    this.cargarMensajesIniciales();
                })
            .subscribe();
    }

    async enviarMensaje(contenido: string) {
        // extraemos datos de sesion actual
        const usuarioLogueado = this.authService.user();

        if (!usuarioLogueado) return; // Seguridad: Si no hay sesión, no hace nada

        // Guardamos el mensaje asociando el ID y el Nombre de tu interfaz de sesión
        await this.supabase.from('Chat').insert({
            contenido: contenido,
            user_id: usuarioLogueado.id,
            usuario_nombre: usuarioLogueado.nombre // <--- Usa el nombre que extrajiste de la metadata
        });
    }
}