// estado de sesion de usuario
export interface UserSession {
    id: string;
    email:string;
    nombre: string;
    apellido: string;
    edad: number;
}

// datos de la tabla de supabase de usuarios
export interface Usuario {
    id?: number;
    created_at?: string;
    authId?: string;
    correo: string;
    nombre: string;
    apellido: string;
    edad: number;
}

export interface Mensaje {
    id: number;
    user_id: string;
    usuario_nombre: string; // Aquí se guardará el nombre automáticamente
    contenido: string;
    created_at: string;
}