// src/app/features/breeding/components/breeding/breeding.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { BreedingEvent } from '../../../../shared/models/breeding.model';
import { BreedingService } from '../../../../core/services/breeding.service';
import { AnimalsService } from '../../../../core/services/animals.service';
import { Animal } from '../../../../shared/models/animal.model';

@Component({
  selector: 'app-breeding',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './breedingEvent.component.html',
  styleUrls: ['./breedingEvent.component.scss'],
})
export class BreedingEventComponent implements OnInit {
  breedingEvents$!: Observable<BreedingEvent[]>;
  animalId!: string;
  animalName: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private breedingService: BreedingService,
    private animalsService: AnimalsService
  ) {}

  ngOnInit(): void {
    this.animalId = this.route.snapshot.paramMap.get('id')!;
    if (this.animalId) {
      this.loadAnimalInfo();
      this.loadEvents();
    }
  }

  loadAnimalInfo() {
    this.animalsService.getAnimal(this.animalId).subscribe({
      next: (animal: Animal | undefined) => {
        if (animal) {
          this.animalName = animal.name;
        }
      },
      error: (error) => {
        console.error('Error loading animal info:', error);
      }
    });
  }

  loadEvents() {
    this.breedingEvents$ = this.breedingService.getBreedingEventsByAnimalId(this.animalId);
  }

  // TrackBy function for performance optimization
  trackByEventId(index: number, event: BreedingEvent): string {
    return event.id || index.toString();
  }

  onAddBreedingEvent() {
    this.router.navigate(['/animals', this.animalId, 'breeding', 'add']);
  }

  onEdit(eventId: string) {
    this.router.navigate(['/animals', this.animalId, 'breeding', 'edit', eventId]);
  }

  onDelete(eventId: string) {
    if (confirm('Are you sure you want to delete this breeding event?')) {
      this.breedingService.deleteBreedingEvent(this.animalId, eventId).subscribe({
        next: () => {
          console.log('Breeding event deleted successfully!');
          this.loadEvents(); // Refresh the list
        },
        error: (error) => {
          console.error('Error deleting breeding event:', error);
        }
      });
    }
  }
}