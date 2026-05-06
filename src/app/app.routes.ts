import { Routes } from '@angular/router';
import { BienvenidaComponent } from './components/bienvenida/bienvenida';
import { LoginComponent } from './components/login/login';
import { QuienSoyComponent } from './components/quien-soy/quien-soy';
import { RegistroComponent } from './components/registro/registro';

export const routes: Routes = [
    { path:'login', component : LoginComponent },
    
    { path:'registro', component : RegistroComponent },
    
    { path:'bienvenida', component : BienvenidaComponent },
    
    { path:'quien-soy', component : QuienSoyComponent }
];
