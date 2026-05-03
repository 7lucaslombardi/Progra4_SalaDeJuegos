import { Component, signal, inject, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-quien-soy',
  imports: [],
  templateUrl: './quien-soy.html',
  styleUrl: './quien-soy.css',
})
export class QuienSoyComponent implements OnInit {
  // Inyectamos el cliente HTTP 
  private http = inject(HttpClient);
  
  // Signal para guardar la respuesta obtenida de github. Empezamos en null mientras carga.
  myData = signal<any>(null);

  ngOnInit(): void {
    
    this.http.get('https://api.github.com/users/7lucaslombardi').subscribe({
        next: (data) => {
          this.myData.set(data);
        },
        error: (err) => {
          console.error('Error cargando el perfil de GitHub', err);
        }
      });
  }
}