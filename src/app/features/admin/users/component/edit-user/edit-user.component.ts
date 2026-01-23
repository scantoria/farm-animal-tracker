// src/app/features/admin/users/component/edit-user/edit-user.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Timestamp } from '@angular/fire/firestore';
import { User } from '../../../../../shared/models/user.model';
import { UserDataService } from '../../../../../core/services/user-data.service';

@Component({
  selector: 'app-edit-user',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './edit-user.component.html',
  styleUrl: './edit-user.component.scss'
})
export class EditUserComponent implements OnInit {
  user: User | undefined;
  isLoading = true;
  isSaving = false;
  errorMessage = '';
  successMessage = '';

  // Role options
  roleOptions: Array<{ value: string; label: string }> = [
    { value: 'Admin', label: 'Administrator' },
    { value: 'User', label: 'Standard User' },
    { value: 'Viewer', label: 'Viewer (Read-only)' }
  ];

  constructor(
    private userService: UserDataService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const userId = this.route.snapshot.paramMap.get('userId');
    if (userId) {
      this.loadUser(userId);
    } else {
      this.errorMessage = 'No user ID provided.';
      this.isLoading = false;
    }
  }

  loadUser(userId: string): void {
    this.userService.getUserById(userId).subscribe({
      next: (user) => {
        if (user) {
          this.user = user;
        } else {
          this.errorMessage = 'User not found.';
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading user:', err);
        this.errorMessage = 'Failed to load user details.';
        this.isLoading = false;
      }
    });
  }

  onSubmit(form: NgForm): void {
    if (form.invalid || !this.user?.id) {
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    const updates: Partial<User> = {
      name: this.user.name,
      role: this.user.role
    };

    this.userService.updateUser(this.user.id, updates)
      .then(() => {
        this.successMessage = 'User updated successfully!';
        this.isSaving = false;
        setTimeout(() => {
          this.router.navigate(['/admin/users']);
        }, 1500);
      })
      .catch((err) => {
        console.error('Error updating user:', err);
        this.errorMessage = 'Failed to update user. Please try again.';
        this.isSaving = false;
      });
  }

  onCancel(): void {
    this.router.navigate(['/admin/users']);
  }

  /**
   * Format a Timestamp or Date for display
   */
  formatTimestamp(value: Date | Timestamp | undefined): string {
    if (!value) return 'N/A';

    let date: Date;
    if (value instanceof Timestamp) {
      date = value.toDate();
    } else {
      date = value;
    }

    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
