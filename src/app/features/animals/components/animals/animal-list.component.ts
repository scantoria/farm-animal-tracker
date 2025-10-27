// src/app/features/animals/animals.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { Animal } from '../../../../shared/models/animal.model';
import { AnimalDataService } from '../../../../core/services/animals-data.service';
import { Auth } from '@angular/fire/auth'; 

@Component({
  selector: 'app-animals',
  standalone: true,
  imports: [CommonModule, RouterModule],
  providers: [AnimalDataService],
  templateUrl: './animal-list.component.html',
  styleUrl: './animal-list.component.scss'
})

export class AnimalsListComponent implements OnInit {
  animals$!: Observable<Animal[]>;

  constructor(
    private router: Router,
    private animalDataService: AnimalDataService,
    private auth: Auth
  ) { }

  ngOnInit(): void {
    // 💥 CHECK 1: Log the current user object
    console.log('Current User State:', this.auth.currentUser);

    // Listen for changes (User might log out after the initial check)
    this.auth.onAuthStateChanged(user => {
      console.log('Auth State Changed. User is:', user);
    });
    
    //this.animals$ = this.animalsService.getAll();
    this.loadAnimals();
  }

  loadAnimals(): void {
    this.animals$ = this.animalDataService.getAll();
  }

  onViewEdit(animalId: string): void {
    this.router.navigate(['/animals', animalId, 'edit']); 
  }

  onDelete(animal: Animal): void {
    if (confirm('Are you sure you want to delete this animal?')) {
      this.animalDataService.deleteAnimal(animal)
        .subscribe({
          next: () => {
            console.log('Animal deleted successfully.');
            // Re-fetch the list to update the view
            this.animals$ = this.animalDataService.getAll();
          },
          error: (error) => {
            console.error('Error deleting animal:', error);
          }
        });
    }
  }
}