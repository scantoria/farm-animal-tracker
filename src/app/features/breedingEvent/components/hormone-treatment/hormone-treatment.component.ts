// src/app/features/breeding/components/hormone-treatment/hormone-treatment.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { BreedingService } from '../../../../core/services/breeding.service';
import { HormoneTreatment } from '../../../../shared/models/hormone-treatment.model';

@Component({
  selector: 'app-hormone-treatment',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './hormone-treatment.component.html',
  styleUrl: './hormone-treatment.component.scss'
})
export class HormoneTreatmentComponent implements OnInit {
  animalId!: string;
  eventId!: string;
  // This observable holds the list of treatments
  hormoneTreatments$!: Observable<HormoneTreatment[]>; 

  constructor(
    private breedingService: BreedingService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.animalId = this.route.snapshot.paramMap.get('id')!;
    this.eventId = this.route.snapshot.paramMap.get('eventId')!;

    if (this.animalId && this.eventId) {
      // Fetch the treatments from the service
      this.hormoneTreatments$ = this.breedingService.getHormoneTreatmentsByBreedingEventId(this.animalId, this.eventId);
    }
  }

  onAddTreatment() {
    this.router.navigate(['/animals', this.animalId, 'breeding', this.eventId, 'add-treatment']);
  }

  onEdit(treatmentId: string) {
    this.router.navigate(['/animals', this.animalId, 'breeding', this.eventId, 'treatments', 'edit', treatmentId]);
  }

  onDelete(treatmentId: string) {
    if (confirm('Are you sure you want to delete this hormone treatment?')) {
      this.breedingService.deleteHormoneTreatment(this.animalId, this.eventId, treatmentId).subscribe({
        next: () => console.log('Hormone treatment deleted successfully!'),
        error: (error) => console.error('Error deleting hormone treatment:', error),
      });
    }
  }

  onBackToBreedingEvent() {
    this.router.navigate(['/animals', this.animalId, 'breeding', 'edit', this.eventId]);
  }
}