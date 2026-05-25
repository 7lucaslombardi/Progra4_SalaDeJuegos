// estado de sesion de usuario
export interface UserSession {
    id: string;
    email: string;
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

export interface RegistroResultados {
    user_id?: string;
    juego: 'AHORCADO' | 'MAYOR-O-MENOR' | 'PREGUNTADOS' | 'CLICK-THE-CIRCLE';
    puntaje: number;
    resultado: boolean;
    tiempo_de_partida: number; // Tiempo en segundos 
    descripcion: string;
    created_at?: string;
    jugador_nombre?: string;
}

// Creamos el molde de lo que puede venir adentro del JSON
export interface DetallesPartida {
    palabra?: string;               // Ahorcado
    letrasSeleccionadas?: number;   // Ahorcado
    errores?: number;               // Ahorcado
    cartas_acertadas?: number;      // Mayor o Menor
    racha_respuestas?: number;      // Preguntados
    clics_totales?: number;         // Click the Circle
    aciertos?: number;              // Click the Circle
}

