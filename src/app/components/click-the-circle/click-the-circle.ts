import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { TiempoService } from '../../services/tiempo.service';
import { DetallesPartida } from '../../models/user.models';
import { RegistrosService } from '../../services/registros.service';

// Definimos cuántos clics hay que hacer para ganar
const META_CLICS = 15;

@Component({
  selector: 'app-click-circle',
  standalone: true,
  imports: [CommonModule],
  providers: [TiempoService], // Reloj independiente para este juego
  templateUrl: './click-the-circle.html',
  styleUrl: './click-the-circle.css'
})
export class ClickTheCircle implements OnInit, OnDestroy {
  private registrosService = inject(RegistrosService);
  private router = inject(Router);
  public cronometro = inject(TiempoService);

  // Variables para llevar la cuenta
  aciertos = signal(0);
  errores = signal(0);
  
  // Variables para controlar dónde aparece el círculo (en porcentajes)
  posicionTop = signal('50%');
  posicionLeft = signal('50%');
  
  juegoTerminado = signal(false);
  guardando = signal(false);

  // El puntaje se calcula en tiempo real: 10 pts por acierto, -5 por error (mínimo 0)
  puntaje = computed(() => {
    return Math.max(0, (this.aciertos() * 10) - (this.errores() * 5));
  });

  // Gana cuando llega a la meta de clics
  victoria = computed(() => this.aciertos() >= META_CLICS);

  ngOnInit() {
    this.nuevaPartida();
  }

  ngOnDestroy() {
    this.cronometro.detenerCronometro();
  }

  nuevaPartida() {
    this.aciertos.set(0);
    this.errores.set(0);
    this.juegoTerminado.set(false);
    this.guardando.set(false);
    
    this.moverCirculo(); // Lo ponemos en una posición random de arranque
    this.cronometro.iniciarCronometro();
  }

  // Función que mueve el círculo a un lugar aleatorio
  moverCirculo() {
    // Generamos un número random entre 10 y 85 para que no se salga de los bordes de la caja
    const top = Math.floor(Math.random() * 75) + 10;
    const left = Math.floor(Math.random() * 75) + 10;
    
    this.posicionTop.set(`${top}%`);
    this.posicionLeft.set(`${left}%`);
  }

  // Cuando el jugador le acierta al círculo
  clickCirculo(evento: Event) {
    // Esto evita que el clic "traspase" el círculo y también cuente como clic en el fondo
    evento.stopPropagation(); 
    
    if (this.juegoTerminado() || this.guardando()) return;

    this.aciertos.update(v => v + 1);

    // Si ya llegó a los 15 clics, cortamos el juego
    if (this.victoria()) {
      this.juegoTerminado.set(true);
      this.cronometro.detenerCronometro();
      this.guardarResultados();
    } else {
      // Si no, lo movemos de lugar para que siga jugando
      this.moverCirculo();
    }
  }

  // Cuando el jugador le pifia y hace clic en el fondo vacío
  clickFondo() {
    if (this.juegoTerminado() || this.guardando()) return;
    this.errores.update(v => v + 1);
  }

  async guardarResultados() {
    this.guardando.set(true);

    const detallesExtras: DetallesPartida = {
      clics_totales: this.aciertos() + this.aciertos(),
      aciertos: this.aciertos()
    };

    await this.registrosService.guardarResultado(
      'CLICK-THE-CIRCLE',
      this.puntaje(),
      true, // Ponemos true porque el objetivo es completarlo, el factor competitivo es el TIEMPO
      this.cronometro.tiempoTranscurrido(),
      detallesExtras
    );

    this.guardando.set(false);
  }

  volver() {
    this.cronometro.detenerCronometro();
    this.router.navigate(['/home']);
  }
}