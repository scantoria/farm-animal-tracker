import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgForm, FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-invite-user',
  templateUrl: './invite-user.component.html',
  styleUrls: ['./invite-user.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule]
})
export class InviteUserComponent {
  successMessage: string = '';
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onSubmit(form: NgForm) {
    this.successMessage = '';
    this.errorMessage = '';

    const email = form.value.email;
    const password = form.value.password;

    this.authService.signUp(email, password)
      .subscribe({
        next: (response) => {
          console.log('User invitation successful:', response);
          this.successMessage = `User ${email} created successfully! They can now log in.`;
          form.resetForm();

          // Auto-navigate back to home after 3 seconds
          setTimeout(() => {
            this.router.navigate(['/']);
          }, 3000);
        },
        error: (error) => {
          console.error('User invitation failed:', error);
          this.errorMessage = error.message || 'Failed to create user. Please try again.';
        }
      });
  }
}
