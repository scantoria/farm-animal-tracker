// src/app/features/admin/components/user-list/user-list.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { User } from '../../../../../shared/models/user.model'; 
import { UserDataService } from '../../../../../core/services/user-data.service';
import { ConfirmService } from '../../../../../core/services/confirm.service'; 

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './user-list.component.html',
  styleUrl: './user-list.component.scss'
})
export class UserListComponent implements OnInit {
  // 1. PROPERTY: Observable stream for the list of users
  users$!: Observable<User[]>; 

  constructor(
    private userService: UserDataService, 
    private router: Router,
    private confirmService: ConfirmService // Used for the confirmation dialog
  ) { }

  ngOnInit(): void {
    // 2. Load the list of users when the component initializes
    this.users$ = this.userService.getAllUsers(); 
  }

  /**
   * Handles the deletion of a user after confirmation.
   * @param id The ID of the user to delete.
   */
  onDelete(id: string, event: Event): void {
    // Crucial: Stop the event from bubbling up to the parent <a> tag (the clickable row)
    event?.stopPropagation(); 

    this.confirmService.confirm(
      'Delete User', 
      'Are you sure you want to delete this user? This action cannot be undone.'
    ).subscribe(confirmed => {
      if (confirmed) {
        // FIX: Change .subscribe({...}) to .then().catch()
        this.userService.deleteUser(id)
          .then(() => {
            console.log(`User with ID ${id} deleted successfully.`);
            // Re-fetch or re-assign the observable to refresh the list
            this.users$ = this.userService.getAllUsers(); 
          })
          .catch((err) => {
            console.error('Error deleting user:', err);
            // Handle error display here
          });
      }
    });
  }
}