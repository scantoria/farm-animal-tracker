import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet, RouterLink } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { Observable } from 'rxjs';
import { Router } from '@angular/router';
import { ToastComponent } from './shared/components/toast/toast.component';
import { NetworkStatusComponent } from './shared/components/network-status/network-status.component';
import { SwUpdateService } from './core/services/sw-update.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, ToastComponent, NetworkStatusComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  isAuthenticated$: Observable<any>;
  title = 'FarmAnimalTracker';

  // Inject to initialize service worker update handling
  private swUpdate = inject(SwUpdateService);

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
