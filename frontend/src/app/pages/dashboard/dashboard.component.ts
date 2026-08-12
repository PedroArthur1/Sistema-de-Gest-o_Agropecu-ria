import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sidebar } from '../../components/sidebar/sidebar';
import { Header } from '../../components/header/header';
import { Welcome } from './welcome/welcome';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, Sidebar, Header, Welcome],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {}
