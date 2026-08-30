import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { RegisterComponent } from './pages/register/register.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { Welcome } from './pages/dashboard/welcome/welcome';
import { Rebanho } from './pages/dashboard/rebanho/rebanho';
import { AnimalCadastro } from './pages/dashboard/rebanho/animal-cadastro/animal-cadastro';
import { AnimalDetalhe } from './pages/dashboard/rebanho/animal-detalhe/animal-detalhe';
import { AnimalEdicao } from './pages/dashboard/rebanho/animal-edicao/animal-edicao';
import { VacinacaoPage } from './pages/dashboard/vacinacao/vacinacao';
import { authGuard } from './guards/auth-guard';
import { AlimentacaoComponent } from './pages/dashboard/alimentacao/alimentacao';
import { TipoAlimentoComponent } from './pages/dashboard/tipo-alimento/tipo-alimento';
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
            { path: 'rebanho/:id', component: AnimalDetalhe },
            { path: 'rebanho/:id/editar', component: AnimalEdicao },
            { path: 'vacinacao', component: VacinacaoPage },
            { path: 'alimentacao', component: AlimentacaoComponent },
            { path: 'alimentacao/tipos', component: TipoAlimentoComponent },
            { path: '', redirectTo: 'welcome', pathMatch: 'full' },
            { path: 'configuracoes', component: Welcome }
        ]
    },
    { path: '**', redirectTo: 'login' }
];
