import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../auth/auth.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { User } from 'firebase/auth';

@Component({
  selector: 'app-user-profile',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.scss'
})
export class UserProfileComponent implements OnInit {
  userEmail$: Observable<string | null> | undefined;

  constructor(private authService: AuthService) { }

  ngOnInit(): void {
    this.userEmail$ = this.authService.currentUser$.pipe(
      map(user => user ? user.email : null)
    );
  }
}