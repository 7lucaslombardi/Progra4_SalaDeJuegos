import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DetallesPartida } from '../../models/user.models';
import { TiempoService } from '../../services/tiempo.service';
import { RegistrosService } from '../../services/registros.service';



// Adapto esta interfaz a la estructura exacta que manda "The Trivia API"
interface PreguntaAPI {
  category: string;
  question: { text: string }; // el texto viene adentro de un objeto
  correctAnswer: string;      // Viene en camelCase
  incorrectAnswers: string[]; // Viene en camelCase
}

// 2. Esta es MI interfaz, la que usa el HTML. No cambia nada, sigue en español.
interface PreguntaProcesada {
  categoria: string;
  enunciado: string;
  correcta: string;
  todasLasOpciones: string[];
}

const PUNTOS_POR_ACIERTO = 15;
const TOTAL_PREGUNTAS = 10;
const ACIERTOS_PARA_GANAR = 6;
const TIEMPO_ESPERA = 1500;

@Component({
  selector: 'app-preguntados',
  standalone: true,
  imports: [CommonModule, RouterModule],
  providers: [TiempoService], 
  templateUrl: './preguntados.html',
  styleUrl: './preguntados.css'
})
export class Preguntados implements OnInit, OnDestroy {
  private http = inject(HttpClient);
  private registrosService = inject(RegistrosService);
  private router = inject(Router);
  public cronometro = inject(TiempoService);

  // Mis variables de control del juego
  listaPreguntas = signal<PreguntaProcesada[]>([]);
  turnoActual = signal(0);
  cantidadAciertos = signal(0);
  
  cargando = signal(false);
  partidaLista = signal(false);
  partidaFinalizada = signal(false);
  guardando = signal(false);

  opcionElegida = signal<string | null>(null);
  pausaBloqueo = signal(false);

  // Me fijo cuál es la pregunta que toca mostrar ahora
  preguntaEnPantalla = computed(() => {
    const preguntas = this.listaPreguntas();
    const turno = this.turnoActual();
    
    // Si ya cargaron las preguntas y no me pasé del límite, la muestro
    if (preguntas.length > 0 && turno < preguntas.length) {
      return preguntas[turno];
    }
    return null;
  });

  puntuacionFinal = computed(() => this.cantidadAciertos() * PUNTOS_POR_ACIERTO);
  esVictoria = computed(() => this.cantidadAciertos() >= ACIERTOS_PARA_GANAR);

  ngOnInit() {
    this.traerPreguntasDeInternet(); 
  }

  ngOnDestroy() {
    this.cronometro.detenerCronometro(); 
  }

  traerPreguntasDeInternet() {
    this.cargando.set(true);
    
    // espero un array directo: <PreguntaAPI[]>
    this.http.get<PreguntaAPI[]>('https://the-trivia-api.com/v2/questions?limit=10')
      .subscribe({
        next: (respuesta) => {
          const preguntasArmadas: PreguntaProcesada[] = [];

          // Recorro el array que me mandó la API
          for (const item of respuesta) {
            
            // Meto todas las respuestas leyendo los nuevos nombres de las propiedades
            const opcionesJuntas = [...item.incorrectAnswers, item.correctAnswer];
            
            // Las mezclo para que la correcta no quede siempre en el mismo botón
            opcionesJuntas.sort(() => 0.5 - Math.random());

            // Traduzco lo que mandó la API a mi formato para que el HTML lo entienda fácil
            preguntasArmadas.push({
              categoria: item.category,
              enunciado: item.question.text, // Accedo a la propiedad 'text' adentro de 'question'
              correcta: item.correctAnswer,
              todasLasOpciones: opcionesJuntas
            });
          }

          this.listaPreguntas.set(preguntasArmadas);
          this.cargando.set(false);
          this.partidaLista.set(true);
          
          this.cronometro.iniciarCronometro(); 
        },
        error: (err) => {
          console.error("Error al traer preguntas de la nueva API:", err);
          this.cargando.set(false);
        }
      });
  }

  // Se ejecuta cuando el jugador hace clic en un botón de respuesta
  evaluarRespuesta(respuestaUsuario: string) {
    if (this.pausaBloqueo()) return;

    this.opcionElegida.set(respuestaUsuario);
    this.pausaBloqueo.set(true);

    const preguntaDeAhora = this.preguntaEnPantalla();

    // Me fijo si le pegó a la correcta
    if (preguntaDeAhora && respuestaUsuario === preguntaDeAhora.correcta) {
      this.cantidadAciertos.update(valor => valor + 1);
    }

    // Dejo un ratito de pausa para que vea si se equivocó o no antes de pasar
    setTimeout(() => this.avanzarRonda(), TIEMPO_ESPERA);
  }

  avanzarRonda() {
    this.pausaBloqueo.set(false);
    this.opcionElegida.set(null);

    // Si todavía me quedan preguntas (índice 0 a 8), paso a la siguiente. 
    if (this.turnoActual() < (TOTAL_PREGUNTAS - 1)) {
      this.turnoActual.update(valor => valor + 1);
    } else {
      // Si ya era la última (índice 9), termino todo
      this.partidaFinalizada.set(true);
      this.cronometro.detenerCronometro();
      this.guardarResultados();
    }
  }

  async guardarResultados() {
    this.guardando.set(true);
    const tiempoFinal = this.cronometro.tiempoTranscurrido();

    // Armo la info extra que guardamos como JSON en la base (DetallesPartida)
    const detallesExtras: DetallesPartida = {
      racha_respuestas: this.cantidadAciertos()
    };

    await this.registrosService.guardarResultado(
      'PREGUNTADOS',
      this.puntuacionFinal(),
      this.esVictoria(),
      tiempoFinal,
      detallesExtras
    );
    
    this.guardando.set(false);
  }

  reiniciarPartida() {
    this.turnoActual.set(0);
    this.cantidadAciertos.set(0);
    this.partidaFinalizada.set(false);
    this.traerPreguntasDeInternet();
  }

  volver() {
    this.cronometro.detenerCronometro();
    this.router.navigate(['/home']);
  }
}
