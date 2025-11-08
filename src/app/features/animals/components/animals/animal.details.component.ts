// src/app/features/animals/animals.component.ts

import { Component, OnInit } from '@angular/core';
import { AnimalsService } from '../../../../core/services/animals.service';
import { BreedingService } from '../../../../core/services/breeding.service';
import { Animal } from '../../../../shared/models/animal.model';
import { BreedingEvent } from '../../../../shared/models/breeding.model';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { calculateDueDate, formatDueDate } from '../../../../shared/utils/gestation-period.util';
import { Timestamp } from '@angular/fire/firestore'; 

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
  pregnantAnimalDueDates: Map<string, string> = new Map();

  constructor(
    private animalsService: AnimalsService,
    private breedingService: BreedingService,
    private auth: Auth
  ) { }

  getReproductiveStatusDisplay(animal: Animal): string {
    if (!animal.reproductiveStatus || animal.reproductiveStatus === 'unknown') {
      return '-';
    }

    const status = animal.reproductiveStatus;

    // Capitalize first letter
    return status.charAt(0).toUpperCase() + status.slice(1);
  }

  trackByAnimalId(index: number, animal: any): string {
    return animal.id;
  }

  ngOnInit(): void {
    // 💥 CHECK 1: Log the current user object
    console.log('Current User State:', this.auth.currentUser);

    // Listen for changes (User might log out after the initial check)
    this.auth.onAuthStateChanged(user => {
      console.log('Auth State Changed. User is:', user);
    });

    this.animals$ = this.animalsService.getAll().pipe(
      tap(animals => {
        // For each pregnant animal, fetch their latest breeding event
        animals.forEach(animal => {
          if (animal.reproductiveStatus === 'pregnant' && animal.id) {
            this.loadEstimatedDueDate(animal);
          }
        });
      })
    );
  }

  private loadEstimatedDueDate(animal: Animal): void {
    if (!animal.id) return;

    this.breedingService.getBreedingEventsByAnimalId(animal.id).subscribe({
      next: (breedingEvents) => {
        if (breedingEvents && breedingEvents.length > 0) {
          // Get the most recent breeding event
          const sortedEvents = breedingEvents.sort((a, b) => {
            const dateA = this.convertToDate(a.date);
            const dateB = this.convertToDate(b.date);
            return dateB.getTime() - dateA.getTime();
          });

          const latestBreeding = sortedEvents[0];
          const breedingDate = this.convertToDate(latestBreeding.date);
          const dueDate = calculateDueDate(breedingDate, animal.species);

          if (dueDate && animal.id) {
            this.pregnantAnimalDueDates.set(animal.id, formatDueDate(dueDate));
          }
        }
      },
      error: (error) => {
        console.error(`Error loading breeding events for animal ${animal.id}:`, error);
      }
    });
  }

  private convertToDate(date: string | Timestamp | Date): Date {
    if (date instanceof Timestamp) {
      return date.toDate();
    } else if (typeof date === 'string') {
      return new Date(date);
    } else {
      return date;
    }
  }

  getEstimatedDueDate(animal: Animal): string {
    if (animal.reproductiveStatus !== 'pregnant' || !animal.id) {
      return '';
    }
    return this.pregnantAnimalDueDates.get(animal.id) || 'Calculating...';
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