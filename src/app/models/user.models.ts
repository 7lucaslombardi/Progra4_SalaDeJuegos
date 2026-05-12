// estado de sesion de usuario
export interface UserSession {
    id: string;
    email:string;
    // correo: string;
    // nombre: string;
    // apellido: string;
    // edad: number;
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