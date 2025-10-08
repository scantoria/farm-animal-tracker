// src/app/features/animals/animals.component.ts

import { Component, OnInit } from '@angular/core';
import { AnimalsService } from '../../../../core/services/animals.service';
import { Animal } from '../../../../shared/models/animal.model';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Auth } from '@angular/fire/auth'; 

@Component({
  selector: 'app-animals',
  standalone: true,
  imports: [CommonModule, RouterLink],
  providers: [AnimalsService],
  templateUrl: './animal-details.component.html',
  styleUrl: './animal-details.component.scss'
})
export class AnimalsComponent implements OnInit {

  animals$!: Observable<Animal[]>;

  constructor(
    private animalsService: AnimalsService,
    private auth: Auth
  ) { }

  ngOnInit(): void {
    // 💥 CHECK 1: Log the current user object
    console.log('Current User State:', this.auth.currentUser);

    // Listen for changes (User might log out after the initial check)
    this.auth.onAuthStateChanged(user => {
      console.log('Auth State Changed. User is:', user);
    });
    
    this.animals$ = this.animalsService.getAll();
  }

  deleteAnimal(animal: Animal): void {
    if (confirm('Are you sure you want to delete this animal?')) {
      this.animalsService.deleteAnimal(animal)
        .subscribe({
          next: () => {
            console.log('Animal deleted successfully.');
            // Re-fetch the list to update the view
            this.animals$ = this.animalsService.getAll();
          },
          error: (error) => {
            console.error('Error deleting animal:', error);
          }
        });
    }
  }
}