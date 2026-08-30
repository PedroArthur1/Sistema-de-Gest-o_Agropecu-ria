import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
  userData = { nome: '', email: '', password: '', role: 'USER' };
  errorMessage = '';
  isSubmitting = false;
  submitted = false;

  constructor(private authService: AuthService, private router: Router) { }

  onSubmit(form?: NgForm): void {
    this.submitted = true;
    this.errorMessage = '';

    if (form && !form.valid) {
      this.errorMessage = 'Por favor, preencha todos os campos obrigatórios corretamente.';
      return;
    }

    this.isSubmitting = true;
    this.authService.register(this.userData).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.router.navigate(['/login']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.errorMessage = 'Erro ao realizar cadastro. Tente novamente.';
      }
    });
  }
}