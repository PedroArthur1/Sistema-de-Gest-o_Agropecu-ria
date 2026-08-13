import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { Welcome } from './pages/dashboard/welcome/welcome';
import { Rebanho } from './pages/dashboard/rebanho/rebanho';
import { AnimalCadastro } from './pages/dashboard/rebanho/animal-cadastro/animal-cadastro';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
    { path: '', redirectTo: 'login', pathMatch: 'full' },
    { path: 'login', component: LoginComponent },
    { path: 'register', component: RegisterComponent },
    { 
        path: 'dashboard', 
        component: DashboardComponent, 
        canActivate: [authGuard],
        children: [
            { path: '', component: Welcome },
            { path: 'rebanho', component: Rebanho },
            { path: 'rebanho/novo', component: AnimalCadastro },
            { path: 'pastagem', component: Welcome },
            { path: 'vacinacao', component: Welcome },
            { path: 'reproducao', component: Welcome },
            { path: 'financas', component: Welcome },
            { path: 'configuracoes', component: Welcome }
        ]
    },
    { path: '**', redirectTo: 'login' }
];
