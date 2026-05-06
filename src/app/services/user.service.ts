import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable({ // @: decorador para palabras reservadas
  providedIn: 'root', // va a poder ser utilizado en cualquier parte del codigo
})


export class UserService {
    // Inyectamos el cliente HTTP 
    private http = inject(HttpClient);

    // Signal donde se guardan los datos del usuario, arranca en null y despues se cambia con el set
    myData = signal<any>(null);
    loading = signal<boolean>(false);
    error = signal<boolean>(false);

    loadProfile() {
    this.loading.set(true);
    this.error.set(false);
    }

    // Método para obtener usuario desde GitHub
    obtenerUsuario(): void {
    
    this.http.get('https://api.github.com/users/7lucaslombardi').subscribe({
        
        // Guardamos la respuesta en el signal
        next: (data) => {
        this.myData.set(data);
        this.loading.set(false);
        },
        error: (err) => {
        console.error('Error cargando el perfil de GitHub', err);
        this.error.set(true);
        this.loading.set(false);
        }
    });
    }
}