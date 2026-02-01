// src/app/features/hormone-treatment/components/add-hormone-treatment/add-hormone-treatment.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HormoneTreatmentService, StandaloneHormoneTreatment, HORMONE_PROTOCOLS } from '../../../../core/services/hormone-treatment.service';
import { AnimalsService } from '../../../../core/services/animals.service';

@Component({
  selector: 'app-add-hormone-treatment',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './add-hormone-treatment.component.html',
  styleUrl: './add-hormone-treatment.component.scss'
})
export class StandaloneAddHormoneTreatmentComponent implements OnInit {
  animalId!: string;
  animalName: string = '';
  isSubmitting: boolean = false;

  hormoneProtocols = HORMONE_PROTOCOLS;

  treatment: Partial<StandaloneHormoneTreatment> = {
    treatmentDate: new Date().toISOString().split('T')[0],
    hormoneType: '',
    protocol: '',
    dosage: '',
    dosageUnit: 'ml',
    expectedBreedingDate: '',
    administeredBy: '',
    notes: ''
  };

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private hormoneTreatmentService: HormoneTreatmentService,
    private animalsService: AnimalsService
  ) {}

  ngOnInit(): void {
    this.animalId = this.route.snapshot.paramMap.get('id')!;
    this.loadAnimalInfo();
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

    const newTreatment: StandaloneHormoneTreatment = {
      animalId: this.animalId,
      treatmentDate: this.treatment.treatmentDate!,
      hormoneType: this.treatment.hormoneType!,
      protocol: this.treatment.protocol || undefined,
      dosage: this.treatment.dosage || undefined,
      dosageUnit: this.treatment.dosageUnit || undefined,
      expectedBreedingDate: this.treatment.expectedBreedingDate || undefined,
      administeredBy: this.treatment.administeredBy || undefined,
      notes: this.treatment.notes || undefined
    };

    this.hormoneTreatmentService.addTreatment(this.animalId, newTreatment).subscribe({
      next: () => {
        this.router.navigate(['/animals', this.animalId, 'hormone-treatments']);
      },
      error: (error) => {
        console.error('Error adding treatment:', error);
        this.isSubmitting = false;
        alert('Error adding treatment. Please try again.');
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/animals', this.animalId, 'hormone-treatments']);
  }
}
