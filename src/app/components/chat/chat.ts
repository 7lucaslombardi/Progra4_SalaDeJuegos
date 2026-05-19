import { Component, inject, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat.html',
  styleUrl: './chat.css'
})
export class ChatComponent implements AfterViewChecked {
  chatService = inject(ChatService);
  authService = inject(AuthService);
  
  nuevoMensaje = '';


  // SCROLL AUTOMÁTICO
  // Cada vez que Angular detecta un cambio (llega un mensaje), 
  // busca el elemento con el ID 'ancla-chat' y hace foco en él.

  ngAfterViewChecked() {
    const ancla = document.getElementById('ancla-chat');
    if (ancla) {
      ancla.scrollIntoView({ behavior: 'smooth' }); // 'smooth' hace que baje suavemente
    }
  }


  // LÓGICA DEL CHAT


  async enviar() {
    const texto = this.nuevoMensaje.trim();

    if (texto) {
      // Mandamos el mensaje al servicio (el servicio ya sabe quién es el usuario logueado)
      await this.chatService.enviarMensaje(texto);
      
      // Limpiamos el input al instante
      this.nuevoMensaje = '';
    }
  }

  // Compara el ID del mensaje con nuestro ID de sesión para saber de qué color pintar la burbuja
  esMiMensaje(userIdDelMensaje: string): boolean {
    const miUsuario = this.authService.user();
    return miUsuario ? miUsuario.id === userIdDelMensaje : false;
  }
}