import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth/auth.service';

@Component({
  selector: 'app-welcome',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './welcome.html',
  styleUrl: './welcome.css',
})
export class Welcome implements OnInit {
  role: string | null = '';
  userName: string | null = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.role = this.authService.getRole();
    this.userName = this.authService.getUserName();
  }
}
