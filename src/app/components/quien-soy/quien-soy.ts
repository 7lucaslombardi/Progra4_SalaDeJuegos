import { Component, inject, OnInit } from '@angular/core';
import { UserService } from '../../service/user.service';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-quien-soy',
  imports: [DatePipe],
  templateUrl: './quien-soy.html',
  styleUrl: './quien-soy.css',
})
export class QuienSoyComponent implements OnInit {

  // Inyectamos el servicio
  private userService = inject(UserService);

  // Referencia al signal del service
  usuario = this.userService.myData;

  ngOnInit() {
    // Cuando carga el componente, pedimos los datos
    this.userService.obtenerUsuario();
  }
}