import { Component } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { Router } from '@angular/router'; // Add this line

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  standalone: true, 
  imports: [FormsModule] 
})
export class SignupComponent {
  constructor(private authService: AuthService, private router: Router) {} // Update this line

  onSubmit(form: NgForm) {
    const email = form.value.email;
    const password = form.value.password;

    this.authService.signUp(email, password)
      .subscribe({
        next: (response) => {
          console.log('Signup successful:', response);
          form.resetForm(); // Add this line
          this.router.navigate(['/login']); // Add this line
        },
        error: (error) => {
          console.error('Signup failed:', error);
        }
      });
  }
}