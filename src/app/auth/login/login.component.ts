import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgForm, FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
export class LoginComponent {
  constructor(private authService: AuthService, private router: Router) {} // Update this line

  onSubmit(form: NgForm) {
    const email = form.value.email;
    const password = form.value.password;

    this.authService.signIn(email, password)
      .subscribe({
        next: (response) => {
          console.log('Login successful:', response);
          form.resetForm();
          this.router.navigate(['/']);
        },
        error: (error) => {
          console.error('Login failed:', error);
        }
      });
  }
}