import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { HeaderComponent } from './components/header/header';
import { ChatComponent } from './components/chat/chat';
import { AuthService } from './services/auth.service';




@Component({
  selector: 'app-root',
  imports: [RouterOutlet, HeaderComponent, ChatComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Progra4_SalaDeJuegos');
  private router = inject(Router);
  public authService = inject(AuthService);

  public mostrarChat = false;

  // Controla si la ventana está abierta o cerrada
  public chatAbierto: boolean = false;

  //  Alterna el estado de la ventana
  toggleChat() {
    this.chatAbierto = !this.chatAbierto;
  }

  ngOnInit() {
    // 1. Chequeo inicial al cargar la página por primera vez
    this.evaluarRuta(this.router.url);

    // 2. Nos suscribimos a TODOS los movimientos del router de forma directa
    this.router.events.subscribe((event: any) => {

      // 3. Usamos un simple 'if' para filtrar solo cuando la navegación termina
      if (event instanceof NavigationEnd) {
        this.evaluarRuta(event.urlAfterRedirects);
      }

    });
  }

  private evaluarRuta(url: string) {
    // Chequeamos sesión
    const usuarioLogueado = this.authService.isAuthenticated();

    // Chequeamos si es una de las rutas donde el chat NO debe ir
    const esRutaExcluida = url.includes('login') || url.includes('registro');

    // Mostramos u ocultamos
    this.mostrarChat = usuarioLogueado && !esRutaExcluida;
  }
}

