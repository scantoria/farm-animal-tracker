// src/app/features/hormone-treatment/components/edit-hormone-treatment/edit-hormone-treatment.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { take } from 'rxjs/operators';
import { HormoneTreatmentService, StandaloneHormoneTreatment, HORMONE_PROTOCOLS } from '../../../../core/services/hormone-treatment.service';
import { AnimalsService } from '../../../../core/services/animals.service';

@Component({
  selector: 'app-edit-hormone-treatment',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './edit-hormone-treatment.component.html',
  styleUrl: './edit-hormone-treatment.component.scss'
})
export class StandaloneEditHormoneTreatmentComponent implements OnInit {
  animalId!: string;
  treatmentId!: string;
  animalName: string = '';
  isLoading: boolean = true;
  isSubmitting: boolean = false;

  hormoneProtocols = HORMONE_PROTOCOLS;

  treatment: Partial<StandaloneHormoneTreatment> = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private hormoneTreatmentService: HormoneTreatmentService,
    private animalsService: AnimalsService
  ) {}

  ngOnInit(): void {
    this.animalId = this.route.snapshot.paramMap.get('id')!;
    this.treatmentId = this.route.snapshot.paramMap.get('treatmentId')!;
    this.loadAnimalInfo();
    this.loadTreatment();
  }

  loadAnimalInfo(): void {
    this.animalsService.getAnimal(this.animalId).subscribe({
      next: (animal) => {
        if (animal) {
          this.animalName = animal.name;
        }
      },
      error: (error) => console.error('Error loading animal:', error)
    });
  }

  loadTreatment(): void {
    this.hormoneTreatmentService.getTreatmentsByAnimalId(this.animalId).pipe(take(1)).subscribe({
      next: (treatments) => {
        const treatment = treatments.find(t => t.id === this.treatmentId);
        if (treatment) {
          this.treatment = { ...treatment };
        } else {
          console.error('Treatment not found');
          this.router.navigate(['/animals', this.animalId, 'hormone-treatments']);
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading treatment:', error);
        this.isLoading = false;
        this.router.navigate(['/animals', this.animalId, 'hormone-treatments']);
      }
    });
  }

  onHormoneTypeChange(): void {
    if (this.treatment.treatmentDate && this.treatment.hormoneType) {
      this.treatment.expectedBreedingDate = this.hormoneTreatmentService.calculateExpectedBreedingDate(
        this.treatment.treatmentDate,
        this.treatment.hormoneType
      );
    }
  }

  onTreatmentDateChange(): void {
    if (this.treatment.treatmentDate && this.treatment.hormoneType) {
      this.treatment.expectedBreedingDate = this.hormoneTreatmentService.calculateExpectedBreedingDate(
        this.treatment.treatmentDate,
        this.treatment.hormoneType
      );
    }
  }

  onSubmit(form: NgForm): void {
    if (form.invalid || this.isSubmitting) {
      Object.keys(form.controls).forEach(key => {
        form.controls[key].markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;

    const updateData: Partial<StandaloneHormoneTreatment> = {
      treatmentDate: this.treatment.treatmentDate,
      hormoneType: this.treatment.hormoneType,
      protocol: this.treatment.protocol || undefined,
      dosage: this.treatment.dosage || undefined,
      dosageUnit: this.treatment.dosageUnit || undefined,
      expectedBreedingDate: this.treatment.expectedBreedingDate || undefined,
      administeredBy: this.treatment.administeredBy || undefined,
      notes: this.treatment.notes || undefined
    };

    this.hormoneTreatmentService.updateTreatment(this.animalId, this.treatmentId, updateData).subscribe({
      next: () => {
        this.router.navigate(['/animals', this.animalId, 'hormone-treatments']);
      },
      error: (error) => {
        console.error('Error updating treatment:', error);
        this.isSubmitting = false;
        alert('Error updating treatment. Please try again.');
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/animals', this.animalId, 'hormone-treatments']);
  }
}
