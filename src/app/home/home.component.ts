import { Component } from '@angular/core';
import { AnimalsComponent } from '../features/animals/components/animals/animal.details.component';
import { RouterLink } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [AnimalsComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  onLogout(): void {
    this.authService.signOut()
      .subscribe({
        next: () => {
          this.router.navigate(['/login']);
        },
        error: (error) => {
          console.error('Logout failed:', error);
        }
      });
  }
}