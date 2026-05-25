import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TiempoService } from '../../services/tiempo.service';
import { DetallesPartida } from '../../models/user.models';
import { RegistrosService } from '../../services/registros.service';

// Defino cómo es una carta y qué palos hay disponibles
type Palo = '♠' | '♥' | '♦' | '♣';
interface Carta {
  valor: number;
  palo: Palo;
  nombre: string;
}

const PALOS: Palo[] = ['♠', '♥', '♦', '♣'];
const NOMBRES_CARTAS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

// Dejo los ajustes generales acá arriba para no tener números sueltos y que sea fácil cambiarlos después
const TOTAL_RONDAS = 10; 
const TIEMPO_TRANSICION = 1200;
const SISTEMA_PUNTOS = {
  aciertoBase: 10,
  bonusRacha: 5
};

// Esta función me arma el mazo completo y lo mezcla para que las cartas siempre salgan aleatorias
function generarMazoAleatorio(): Carta[] {
  const mazoNuevo: Carta[] = [];
  
  for (const palo of PALOS) {
    for (let i = 0; i < NOMBRES_CARTAS.length; i++) {
      mazoNuevo.push({ 
        valor: i + 1, 
        palo: palo, 
        nombre: NOMBRES_CARTAS[i] 
      });
    }
  }
  
  return mazoNuevo.sort(() => 0.5 - Math.random());
}

@Component({
  selector: 'app-mayor-menor',
  standalone: true,
  imports: [CommonModule],
  providers: [TiempoService], // Le armo un cronómetro propio a este juego
  templateUrl: './mayor-o-menor.html',
  styleUrl: './mayor-o-menor.css'
})
export class MayorOMenor implements OnInit, OnDestroy {
  // Traigo los servicios que necesito usar
  private registrosService = inject(RegistrosService);
  private router = inject(Router);
  public cronometro = inject(TiempoService);

  // Mis variables para llevar el control de todo lo que pasa en la partida
  mazo = signal<Carta[]>([]);
  cartaActual = signal<Carta | null>(null);
  cartaSiguiente = signal<Carta | null>(null);

  acertadas = signal(0);
  rachaActual = signal(0);
  rachaMaxima = signal(0);
  ronda = signal(0);
  juegoTerminado = signal(false);
  guardando = signal(false);
  ultimoResultado = signal<'acierto' | 'fallo' | null>(null);
  mostrarSiguiente = signal(false);

  // Un pequeño atajo para saber si tengo que pintar el palo de rojo en el HTML
  esRoja = (palo: Palo) => ['♥', '♦'].includes(palo);

  // Me calcula los puntos finales sumando los aciertos y el bonus por la mejor racha que metí
  puntaje = computed(() => {
    const puntosAciertos = this.acertadas() * SISTEMA_PUNTOS.aciertoBase;
    const puntosRacha = this.rachaMaxima() * SISTEMA_PUNTOS.bonusRacha;
    return puntosAciertos + puntosRacha;
  });

  // Para considerar que gané, tengo que haberle pegado por lo menos a la mitad de las rondas
  victoria = computed(() => this.acertadas() >= (TOTAL_RONDAS / 2));

  ngOnInit() {
    this.nuevaPartida(); // Apenas entro a la pantalla, arranca el juego limpio
  }

  ngOnDestroy() {
    this.cronometro.detenerCronometro(); // Apago el reloj si me voy a otra página para que no gaste memoria
  }

  nuevaPartida() {
    // Preparo el mazo y pongo todo a cero para arrancar fresco
    const cartas = generarMazoAleatorio();
    this.mazo.set(cartas);
    this.cartaActual.set(cartas[0]);
    
    this.acertadas.set(0);
    this.rachaActual.set(0);
    this.rachaMaxima.set(0);
    this.ronda.set(1);
    this.juegoTerminado.set(false);
    this.guardando.set(false);
    this.ultimoResultado.set(null);
    this.mostrarSiguiente.set(false);

    this.cronometro.iniciarCronometro();
  }

  // La lógica principal de cuando toco el botón de mayor o menor
  elegir(eleccion: 'mayor' | 'menor') {
    // Si ya terminó o está guardando, corto todo acá para no romper el juego
    if (this.juegoTerminado() || this.guardando()) return;

    const visible = this.cartaActual();
    const cartasMazo = this.mazo();
    const turnoActual = this.ronda();

    if (!visible || turnoActual >= cartasMazo.length) return;

    // Saco la carta que sigue y la muestro
    const proxima = cartasMazo[turnoActual];
    this.cartaSiguiente.set(proxima);
    this.mostrarSiguiente.set(true);

    // Acá me fijo si le pegué a la predicción con la lógica que armamos
    const esMayor = proxima.valor > visible.valor;
    const fueAcierto = (eleccion === 'mayor' && esMayor) || (eleccion === 'menor' && !esMayor);

    if (fueAcierto) {
      // Si la pegué, sumo todo y me fijo si superé mi récord de racha
      this.acertadas.update(cantidad => cantidad + 1);
      this.rachaActual.update(racha => racha + 1);
      
      if (this.rachaActual() > this.rachaMaxima()) {
        this.rachaMaxima.set(this.rachaActual());
      }
      this.ultimoResultado.set('acierto');
    } else {
      // Si le pifio, pierdo la racha que traía
      this.rachaActual.set(0);
      this.ultimoResultado.set('fallo');
    }

    // Dejo un ratito de pausa para que se vea la animación de la carta
    setTimeout(async () => {
      this.cartaActual.set(proxima);
      this.cartaSiguiente.set(null);
      this.mostrarSiguiente.set(false);
      this.ultimoResultado.set(null);
      
      this.ronda.update(turno => turno + 1);

      // Si llegué a la última ronda, corto el reloj y mando los datos a Supabase
      if (this.ronda() > TOTAL_RONDAS) {
        this.juegoTerminado.set(true);
        this.cronometro.detenerCronometro();
        await this.guardarResultados();
      }
    }, TIEMPO_TRANSICION);
  }

  async guardarResultados() {
    this.guardando.set(true);

    // Armo el paquetito de datos extras para mandar a la base de datos
    const detallesExtras: DetallesPartida = {
      cartas_acertadas: this.acertadas(),
      racha_respuestas: this.rachaMaxima()
    };

    // Guardo todo de una llamando al servicio
    await this.registrosService.guardarResultado(
      'MAYOR-O-MENOR',
      this.puntaje(),
      this.victoria(),
      this.cronometro.tiempoTranscurrido(),
      detallesExtras
    );

    this.guardando.set(false);
  }

  volver() {
    // Corto el timer por las dudas y me vuelvo al menú de juegos
    this.cronometro.detenerCronometro();
    this.router.navigate(['/home']);
  }
}