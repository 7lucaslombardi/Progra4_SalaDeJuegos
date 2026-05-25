import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';


import { TiempoService } from '../../services/tiempo.service';
import { RegistrosService } from '../../services/registros.service';
import { AuthService } from '../../services/auth.service';


const PALABRAS = [
  { palabra: 'ANGULAR', pista: 'Framework de Google para crear aplicaciones web.' },
  { palabra: 'TYPESCRIPT', pista: 'Lenguaje principal de Angular, le agrega "tipado" estricto.' },
  { palabra: 'COMPONENTE', pista: 'El bloque de construcción básico de la interfaz visual en Angular.' },
  { palabra: 'SERVICIO', pista: 'Clase donde se pone la lógica de negocio.' },
  { palabra: 'SIGNAL', pista: 'La forma más moderna y reactiva de manejar el estado en Angular.' },
  { palabra: 'ROUTER', pista: 'Herramienta que permite navegar sin recargar el navegador.' },
  { palabra: 'GUARDIAN', pista: 'Protege las rutas para que solo entren usuarios logueados.' },
  { palabra: 'TEMPLATE', pista: 'El archivo HTML donde se define la vista gráfica.' },
  { palabra: 'DIRECTIVA', pista: 'Instrucción en el HTML que modifica el comportamiento del DOM.' },
  { palabra: 'MODULO', pista: 'Contenedor que agrupa código relacionado.' },
  { palabra: 'SUPABASE', pista: 'Base de datos y backend como servicio (BaaS).' },
  { palabra: 'AUTENTICACION', pista: 'Proceso de verificar la identidad de un usuario.' },
  { palabra: 'INTERFAZ', pista: 'Molde exacto para definir la estructura de un objeto.' },
  { palabra: 'VARIABLE', pista: 'Espacio reservado en la memoria para guardar un dato.' },
  { palabra: 'FUNCION', pista: 'Bloque de código reutilizable que realiza una tarea específica.' },
  { palabra: 'PROGRAMACION', pista: 'El arte de darle instrucciones precisas a una computadora.' },
  { palabra: 'ALGORITMO', pista: 'Secuencia lógica y ordenada de pasos para resolver un problema.' },
  { palabra: 'ESTRUCTURA', pista: 'La forma en la que organizamos los archivos del proyecto.' },
  { palabra: 'COMPILADOR', pista: 'Traduce el código a un lenguaje que la máquina entienda.' },
  { palabra: 'FRAMEWORK', pista: 'Entorno de trabajo que te da herramientas y una estructura base.' }
];

const MAX_INTENTOS = 6;
const LETRAS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

@Component({
  selector: 'app-ahorcado',
  standalone: true,
  imports: [CommonModule],
  providers: [TiempoService], //  Instanciamos el reloj privado para este juego
  templateUrl: './ahorcado.html',
  styleUrl: './ahorcado.css'
})
export class AhorcadoComponent implements OnInit {
  private authService = inject(AuthService);
  private registrosService = inject(RegistrosService);
  private router = inject(Router);

  public cronometro = inject(TiempoService);

  readonly letras = LETRAS;

  palabra = signal('');
  pista = signal('');
  letrasUsadas = signal<Set<string>>(new Set());
  guardando = signal(false);
  juegoTerminado = signal(false);

  letrasAdivinadas = computed(() => {
    const usadas = this.letrasUsadas();
    return this.palabra().split('').filter(l => usadas.has(l));
  });

  intentosRestantes = computed(() => {
    const usadas = this.letrasUsadas();
    const incorrectas = [...usadas].filter(l => !this.palabra().includes(l));
    return MAX_INTENTOS - incorrectas.length;
  });

  letrasIncorrectas = computed(() => {
    const usadas = this.letrasUsadas();
    return [...usadas].filter(l => !this.palabra().includes(l));
  });

  palabraMostrada = computed(() =>
    this.palabra().split('').map(l => this.letrasUsadas().has(l) ? l : '_').join(' ')
  );

  victoria = computed(() =>
    this.palabra().length > 0 &&
    this.palabra().split('').every(l => this.letrasUsadas().has(l))
  );

  derrota = computed(() => this.intentosRestantes() <= 0);

  partesMostradas = computed(() => MAX_INTENTOS - this.intentosRestantes());

  // Calculamos el puntaje en tiempo real para que el HTML pueda leerlo
  puntaje = computed(() => {
    const correctas = this.letrasAdivinadas().length;
    const incorrectas = this.letrasIncorrectas().length;
    // Gana 10 puntos por letra correcta, pierde 5 por cada error. Mínimo 0.
    return Math.max(0, (correctas * 10) - (incorrectas * 5));
  });

  ngOnInit() {
    this.nuevaPartida();
  }

  nuevaPartida() {
    const indice = Math.floor(Math.random() * PALABRAS.length);
    const seleccion = PALABRAS[indice];

    this.palabra.set(seleccion.palabra);
    this.pista.set(seleccion.pista);
    this.letrasUsadas.set(new Set());
    this.juegoTerminado.set(false);
    this.guardando.set(false);

    // Arrancamos el reloj desde el servicio
    this.cronometro.iniciarCronometro();
  }

  elegirLetra(letra: string) {
    if (this.juegoTerminado()) return;
    if (this.letrasUsadas().has(letra)) return;

    this.letrasUsadas.update(set => new Set([...set, letra]));

    if (this.victoria() || this.derrota()) {
      this.juegoTerminado.set(true);

      // Frenamos el reloj visualmente en el instante que gana o pierde
      this.cronometro.detenerCronometro();

      this.guardarResultado();
    }
  }

  yaUsada(letra: string): boolean {
    return this.letrasUsadas().has(letra);
  }

  esCorrecta(letra: string): boolean {
    return this.palabra().includes(letra);
  }

  async guardarResultado() {
    this.guardando.set(true);

    const segundosJugados = this.cronometro.tiempoTranscurrido();

    const detallesExtras = {
      palabra: this.palabra(),
      letrasSeleccionadas: this.letrasUsadas().size,
      errores: this.letrasIncorrectas().length
    };

    await this.registrosService.guardarResultado(
      'AHORCADO',
      this.puntaje(), // Llamamos al signal directamente
      this.victoria(),
      segundosJugados,
      detallesExtras,
    );

    this.guardando.set(false);
  }

  volver() {
    this.router.navigate(['/home']);
  }
}