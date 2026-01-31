// src/app/features/birth-event/components/birth-event-list/birth-event-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, forkJoin, of, switchMap, map } from 'rxjs';
import { BirthEvent } from '../../../../shared/models/birth-event.model';
import { Animal } from '../../../../shared/models/animal.model';
import { BirthEventService } from '../../../../core/services/birth-event.service';
import { AnimalsService } from '../../../../core/services/animals.service';

interface BirthEventWithCalf extends BirthEvent {
  calf?: Animal;
}

@Component({
  selector: 'app-birth-event-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './birth-event-list.component.html',
  styleUrl: './birth-event-list.component.scss'
})
export class BirthEventListComponent implements OnInit {
  birthEvents$!: Observable<BirthEventWithCalf[]>;
  animalId!: string;
  animalName: string = '';
  animal?: Animal;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private birthEventService: BirthEventService,
    private animalsService: AnimalsService
  ) {}

  ngOnInit(): void {
    this.animalId = this.route.snapshot.paramMap.get('id')!;
    if (this.animalId) {
      this.loadAnimalInfo();
      this.loadBirthEvents();
    }
  }

  loadAnimalInfo() {
    this.animalsService.getAnimal(this.animalId).subscribe({
      next: (animal: Animal | undefined) => {
        if (animal) {
          this.animal = animal;
          this.animalName = animal.name;
        }
      },
      error: (error) => {
        console.error('Error loading animal info:', error);
      }
    });
  }

  loadBirthEvents() {
    this.birthEvents$ = this.birthEventService.getBirthEventsByDamId(this.animalId).pipe(
      switchMap((events) => {
        if (events.length === 0) {
          return of([]);
        }

        // Fetch calf info for each event
        const eventsWithCalves$ = events.map(event =>
          this.animalsService.getAnimal(event.calfId).pipe(
            map(calf => ({
              ...event,
              calf
            } as BirthEventWithCalf))
          )
        );

        return forkJoin(eventsWithCalves$);
      }),
      map(events => events.sort((a, b) => {
        const dateA = this.toDate(a.birthDate);
        const dateB = this.toDate(b.birthDate);
        return dateB.getTime() - dateA.getTime(); // Most recent first
      }))
    );
  }

  trackByEventId(index: number, event: BirthEvent): string {
    return event.id || index.toString();
  }

  onRecordBirth() {
    this.router.navigate(['/animals', this.animalId, 'birth-events', 'record']);
  }

  onViewCalf(calfId: string) {
    this.router.navigate(['/edit-animal', calfId]);
  }

  onEdit(eventId: string) {
    this.router.navigate(['/animals', this.animalId, 'birth-events', 'edit', eventId]);
  }

  onDelete(eventId: string) {
    if (confirm('Are you sure you want to delete this birth event? Note: This will NOT delete the calf animal record.')) {
      this.birthEventService.deleteBirthEvent(this.animalId, eventId).subscribe({
        next: () => {
          console.log('Birth event deleted successfully!');
          this.loadBirthEvents();
        },
        error: (error) => {
          console.error('Error deleting birth event:', error);
        }
      });
    }
  }

  getCalvingEaseClass(ease?: string): string {
    switch (ease) {
      case 'Easy': return 'ease-easy';
      case 'Assisted': return 'ease-assisted';
      case 'Hard Pull': return 'ease-hard';
      case 'Caesarean': return 'ease-caesarean';
      default: return '';
    }
  }

  toDate(value: any): Date {
    if (value?.toDate) {
      return value.toDate();
    }
    return new Date(value);
  }
}
