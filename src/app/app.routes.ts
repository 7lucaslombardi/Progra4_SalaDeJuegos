import { Routes } from '@angular/router';
import { BienvenidaComponent } from './components/bienvenida/bienvenida';
import { LoginComponent } from './components/login/login';
import { QuienSoyComponent } from './components/quien-soy/quien-soy';
import { RegistroComponent } from './components/registro/registro';
import { authGuard } from './guards/auth.guard';
import { invitadoGuard } from './guards/invitado.guard';
import { AhorcadoComponent } from './components/ahorcado/ahorcado';
import { MayorOMenor } from './components/mayor-o-menor/mayor-o-menor';




export const routes: Routes = [

    { path: '', redirectTo: '/bienvenida', pathMatch: 'full' },
    
    { path: 'login', component: LoginComponent , canActivate : [invitadoGuard]},
    
    { path: 'registro', component: RegistroComponent , canActivate : [invitadoGuard]},
    
    { path: 'bienvenida', component: BienvenidaComponent },
    
    { path: 'quien-soy', component: QuienSoyComponent , canActivate : [authGuard]},

    {path : 'bienvenida/ahorcado', component: AhorcadoComponent, canActivate : [authGuard]},

    {path : 'bienvenida/mayor-o-menor', component: MayorOMenor, canActivate : [authGuard]},
    
    { path: '**', redirectTo: '/bienvenida' } // Cualquier ruta inexistente vuelve a bienvenida
];
