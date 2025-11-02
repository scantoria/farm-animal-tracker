import { Component, OnInit } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HormoneTreatment } from '../../../../shared/models/hormone-treatment.model';
import { BreedingService } from '../../../../core/services/breeding.service';
import { take } from 'rxjs/operators';
import { Firestore, doc, DocumentReference } from '@angular/fire/firestore';
import { AnimalsService } from '../../../../core/services/animals.service';
import { Animal } from '../../../../shared/models/animal.model'; 

@Component({
  selector: 'app-edit-hormone-treatment',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './edit-hormone-treatment.component.html',
  styleUrl: './edit-hormone-treatment.component.scss'
})
export class EditHormoneTreatmentComponent implements OnInit {
  animalId!: string;
  eventId!: string;
  treatmentId!: string;
  animalName: string = '';
  hormoneTreatment: HormoneTreatment | undefined;

  hormoneTypes: string[] = ['GnRH', 'Prostaglandin (PGF2α)', 'Progestin (CIDR/MGA)', 'Other'];
  productSuggestions: string[] = ['Lutalyse', 'Estrumate', 'Factrel', 'Cystorelin', 'Eazi-Breed CIDR'];

  constructor(
    private breedingService: BreedingService,
    private route: ActivatedRoute,
    private router: Router,
    private firestore: Firestore,
    private animalsService: AnimalsService
  ) { }

  ngOnInit(): void {
    this.animalId = this.route.snapshot.paramMap.get('id')!;
    this.eventId = this.route.snapshot.paramMap.get('eventId')!;
    this.treatmentId = this.route.snapshot.paramMap.get('treatmentId')!;
    this.loadAnimalInfo();

    if (this.animalId && this.eventId && this.treatmentId) {
      // 1. Fetch the existing record
      this.breedingService.getHormoneTreatment(this.animalId, this.eventId, this.treatmentId)
        .pipe(take(1))
        .subscribe(treatment => {
          this.hormoneTreatment = treatment;
        });
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

  onSubmit(form: NgForm) {
    if (form.invalid || !this.hormoneTreatment) {
      return;
    }

    const animalRef: DocumentReference = doc(this.firestore, `animals/${this.animalId}`);
    const breedingEventRef: DocumentReference = doc(this.firestore, `animals/${this.animalId}/breedingEvents/${this.eventId}`);

    // Create a partial update object, omitting 'id'
    const updatedTreatment: Partial<HormoneTreatment> = {
      treatmentDate: form.value.treatmentDate,
      hormoneType: form.value.hormoneType,
      productUsed: form.value.productUsed, // NEW FIELD
      dosage: form.value.dosage,
      administeredBy: form.value.administeredBy,
      notes: form.value.notes,
      animalRef: animalRef,
      breedingEventRef: breedingEventRef,
    };

    // 2. Update the record
    this.breedingService.updateHormoneTreatment(this.animalId, this.eventId, this.treatmentId, updatedTreatment)
      .subscribe({
        next: () => {
          console.log('Hormone treatment updated successfully!');
          this.navigateBackToList();
        },
        error: (error) => {
          console.error('Error updating hormone treatment:', error);
        }
      });
  }

  onDelete() {
    // ... (Deletion logic remains the same, using the service)
    if (confirm('Are you sure you want to permanently delete this hormone treatment record?')) {
      this.breedingService.deleteHormoneTreatment(this.animalId, this.eventId, this.treatmentId)
        .subscribe({
          next: () => {
            console.log('Hormone treatment deleted successfully!');
            this.navigateBackToList();
          },
          error: (error) => {
            console.error('Error deleting hormone treatment:', error);
          }
        });
    }
  }

  onCancel() {
    this.navigateBackToList();
  }

  private navigateBackToList() {
    this.router.navigate(['/animals', this.animalId, 'breeding', this.eventId, 'treatments']);
  }
}