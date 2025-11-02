// src/app/features/breeding/components/hormone-treatment-list/hormone-treatment-list.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { HormoneTreatment } from '../../../../shared/models/hormone-treatment.model';
import { BreedingService } from '../../../../core/services/breeding.service';
import { AnimalsService } from '../../../../core/services/animals.service';
import { Animal } from '../../../../shared/models/animal.model';

@Component({
  selector: 'app-hormone-treatment-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './hormone-treatment-list.component.html',
  styleUrl: './hormone-treatment-list.component.scss'
})
export class HormoneTreatmentListComponent implements OnInit {
  animalId!: string;
  eventId!: string;
  animalName: string = '';

  // Observable to hold the list of treatments
  hormoneTreatments$!: Observable<HormoneTreatment[]>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private breedingService: BreedingService,
    private animalsService: AnimalsService
  ) { }

  ngOnInit(): void {
    this.animalId = this.route.snapshot.paramMap.get('id')!;
    this.eventId = this.route.snapshot.paramMap.get('eventId')!;
    this.loadAnimalInfo();

    if (this.animalId && this.eventId) {
      this.loadTreatments();
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

  loadTreatments() {
    this.hormoneTreatments$ = this.breedingService.getHormoneTreatmentsByBreedingEventId(
      this.animalId,
      this.eventId
    );
  }

  // TrackBy function for performance optimization
  trackByTreatmentId(index: number, treatment: HormoneTreatment): string {
    return treatment.id || index.toString();
  }

  onAddTreatment() {
    this.router.navigate([
      '/animals', 
      this.animalId, 
      'breeding', 
      this.eventId, 
      'treatments', 
      'add'
    ]);
  }

  onEdit(treatmentId: string) {
    this.router.navigate([
      '/animals', 
      this.animalId, 
      'breeding', 
      this.eventId, 
      'treatments', 
      'edit', 
      treatmentId
    ]);
  }
  
  onDelete(treatmentId: string) {
    if (confirm('Are you sure you want to delete this hormone treatment record?')) {
      this.breedingService.deleteHormoneTreatment(this.animalId, this.eventId, treatmentId)
        .subscribe({
          next: () => {
            console.log('Hormone treatment deleted successfully!');
            this.loadTreatments(); // Refresh the list
          },
          error: (error) => {
            console.error('Error deleting hormone treatment:', error);
          }
        });
    }
  }
  
  onBackToBreedingEvents() {
    // Navigates back to the list of breeding events for this animal
    this.router.navigate(['/animals', this.animalId, 'breeding']);
  }
}