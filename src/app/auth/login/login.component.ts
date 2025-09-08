import { Component } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router'; // Add this line

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [FormsModule]
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
          this.router.navigate(['/']); // Update this line
        },
        error: (error) => {
          console.error('Login failed:', error);
        }
      });
  }
}