// src/app/features/breeding/components/breeding/breeding.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { BreedingEvent } from '../../../../shared/models/breeding.model';
import { BreedingService } from '../../../../core/services/breeding.service';
import { AnimalsService } from '../../../../core/services/animals.service';
import { SireService } from '../../../../core/services/sire.service';
import { Animal } from '../../../../shared/models/animal.model';
import { Sire } from '../../../../shared/models/sire.model';

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
  sireMap: Map<string, Sire> = new Map();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private breedingService: BreedingService,
    private animalsService: AnimalsService,
    private sireService: SireService
  ) {}

  ngOnInit(): void {
    this.animalId = this.route.snapshot.paramMap.get('id')!;
    if (this.animalId) {
      this.loadAnimalInfo();
      this.loadSires();
      this.loadEvents();
    }
  }

  loadSires(): void {
    this.sireService.getAll().subscribe({
      next: (sires) => {
        sires.forEach(sire => {
          if (sire.id) {
            this.sireMap.set(sire.id, sire);
          }
        });
      },
      error: (error) => console.error('Error loading sires:', error)
    });
  }

  getSireName(event: BreedingEvent): string {
    if (!event.sireId) return '';
    const sire = this.sireMap.get(event.sireId);
    return sire ? sire.name : 'Unknown';
  }

  getSireInfo(event: BreedingEvent): string {
    if (!event.sireId) return '';
    const sire = this.sireMap.get(event.sireId);
    if (!sire) return '';
    return `${sire.breed} (${this.getSourceLabel(sire.source)})`;
  }

  getSourceLabel(source: string): string {
    switch (source) {
      case 'ai': return 'AI';
      case 'leased': return 'Leased';
      case 'owned': return 'Owned';
      default: return source;
    }
  }

  getSireBloodline(event: BreedingEvent): string {
    if (!event.sireId) return '';
    const sire = this.sireMap.get(event.sireId);
    if (!sire) return '';

    const parts = [];
    if (sire.sireName) parts.push(`Grandsire: ${sire.sireName}`);
    if (sire.damName) parts.push(`Granddam: ${sire.damName}`);
    if (parts.length === 0 && sire.bloodline) {
      return sire.bloodline;
    }
    return parts.length > 0 ? parts.join(', ') : '';
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
