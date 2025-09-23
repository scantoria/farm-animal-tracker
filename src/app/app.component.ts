import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  isAuthenticated$: Observable<any>;
  title = 'FarmAnimalTracker';

  constructor(private authService: AuthService, private router: Router) {
    this.isAuthenticated$ = this.authService.currentUser$;
  }

  ngOnInit(): void {
    this.isAuthenticated$ = this.authService.currentUser$;
  }

  onLogout(): void {
    this.authService.signOut()
      .subscribe({
        next: () => {
          this.router.navigate(['/login']);
        }
      });
  }
}