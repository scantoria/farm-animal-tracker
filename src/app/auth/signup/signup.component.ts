import { Component } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss'],
  standalone: true, 
  imports: [FormsModule] 
})
export class SignupComponent {
  constructor(private authService: AuthService) {}

  onSubmit(form: NgForm) {
    const email = form.value.email;
    const password = form.value.password;

    this.authService.signUp(email, password)
      .subscribe({
        next: (response) => {
          console.log('Signup successful:', response);
        },
        error: (error) => {
          console.error('Signup failed:', error);
        }
      });
  }
}