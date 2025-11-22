// src/app/features/animals/animals.component.ts

import { Component, OnInit } from '@angular/core';
import { AnimalsService } from '../../../../core/services/animals.service';
import { BreedingService } from '../../../../core/services/breeding.service';
import { Animal } from '../../../../shared/models/animal.model';
import { BreedingEvent } from '../../../../shared/models/breeding.model';
import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { calculateDueDate, formatDueDate } from '../../../../shared/utils/gestation-period.util';
import { Timestamp } from '@angular/fire/firestore';
import { FormsModule } from '@angular/forms';

interface GroupedAnimals {
  species: string;
  animals: Animal[];
}

@Component({
  selector: 'app-animals',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  providers: [AnimalsService],
  templateUrl: './animal-details.component.html',
  styleUrl: './animal-details.component.scss'
})
export class AnimalsComponent implements OnInit {

  animals$!: Observable<Animal[]>;
  pregnantAnimalDueDates: Map<string, string> = new Map();

  // Sorting and grouping properties
  sortBy: 'name' | 'species' | 'dob' = 'name';
  groupBySpecies: boolean = false;
  groupedAnimals: GroupedAnimals[] = [];

  // Bloodline lookup map (animal ID -> animal name)
  animalNameMap: Map<string, string> = new Map();

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
      map(animals => this.sortAnimals(animals)),
      tap(animals => {
        // Build animal name lookup map for bloodline display
        this.animalNameMap.clear();
        animals.forEach(animal => {
          if (animal.id) {
            this.animalNameMap.set(animal.id, animal.name);
          }
        });

        // For each pregnant animal, fetch their latest breeding event
        animals.forEach(animal => {
          if (animal.reproductiveStatus === 'pregnant' && animal.id) {
            this.loadEstimatedDueDate(animal);
          }
        });

        // Update grouped animals if grouping is enabled
        if (this.groupBySpecies) {
          this.updateGroupedAnimals(animals);
        }
      })
    );
  }

  // Get parent names for bloodline display
  getParentNames(animal: Animal): string {
    const sireName = animal.sireId ? this.animalNameMap.get(animal.sireId) : null;
    const damName = animal.damId ? this.animalNameMap.get(animal.damId) : null;

    if (sireName && damName) {
      return `${sireName} × ${damName}`;
    } else if (sireName) {
      return `Sire: ${sireName}`;
    } else if (damName) {
      return `Dam: ${damName}`;
    }
    return '-';
  }

  getSireName(animal: Animal): string {
    return animal.sireId ? (this.animalNameMap.get(animal.sireId) || 'Unknown') : '-';
  }

  getDamName(animal: Animal): string {
    return animal.damId ? (this.animalNameMap.get(animal.damId) || 'Unknown') : '-';
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
            this.animals$ = this.animalsService.getAll().pipe(
              map(animals => this.sortAnimals(animals)),
              tap(animals => {
                if (this.groupBySpecies) {
                  this.updateGroupedAnimals(animals);
                }
              })
            );
          },
          error: (error) => {
            console.error('Error deleting animal:', error);
          }
        });
    }
  }

  // Sorting logic
  sortAnimals(animals: Animal[]): Animal[] {
    const sortedAnimals = [...animals];

    switch (this.sortBy) {
      case 'species':
        return sortedAnimals.sort((a, b) => {
          const speciesA = (a.species || '').toLowerCase();
          const speciesB = (b.species || '').toLowerCase();
          if (speciesA === speciesB) {
            return (a.name || '').toLowerCase().localeCompare((b.name || '').toLowerCase());
          }
          return speciesA.localeCompare(speciesB);
        });

      case 'dob':
        return sortedAnimals.sort((a, b) => {
          const dateA = a.dob ? this.convertToDate(a.dob).getTime() : 0;
          const dateB = b.dob ? this.convertToDate(b.dob).getTime() : 0;
          return dateB - dateA; // Newest first
        });

      case 'name':
      default:
        return sortedAnimals.sort((a, b) =>
          (a.name || '').toLowerCase().localeCompare((b.name || '').toLowerCase())
        );
    }
  }

  // Grouping logic
  updateGroupedAnimals(animals: Animal[]): void {
    const groups = new Map<string, Animal[]>();

    animals.forEach(animal => {
      const species = animal.species || 'Unknown';
      if (!groups.has(species)) {
        groups.set(species, []);
      }
      groups.get(species)!.push(animal);
    });

    this.groupedAnimals = Array.from(groups.entries())
      .map(([species, animals]) => ({ species, animals }))
      .sort((a, b) => a.species.localeCompare(b.species));
  }

  // Event handlers
  onSortChange(): void {
    this.animals$ = this.animalsService.getAll().pipe(
      map(animals => this.sortAnimals(animals)),
      tap(animals => {
        // For each pregnant animal, fetch their latest breeding event
        animals.forEach(animal => {
          if (animal.reproductiveStatus === 'pregnant' && animal.id) {
            this.loadEstimatedDueDate(animal);
          }
        });

        if (this.groupBySpecies) {
          this.updateGroupedAnimals(animals);
        }
      })
    );
  }

  onGroupToggle(): void {
    this.animals$.subscribe(animals => {
      if (this.groupBySpecies) {
        this.updateGroupedAnimals(animals);
      }
    });
  }

  trackBySpecies(index: number, group: GroupedAnimals): string {
    return group.species;
  }
}