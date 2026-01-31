import { Component, OnInit } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Firestore, doc, DocumentReference, Timestamp } from '@angular/fire/firestore';
import { switchMap } from 'rxjs/operators';
import { BirthingSchedule } from '../../../../shared/models/birthing-schedule.model';
import { BirthingService } from '../../../../core/services/birthing.service';
import { AnimalsService } from '../../../../core/services/animals.service';
import { Animal } from '../../../../shared/models/animal.model';

@Component({
  selector: 'app-add-birthing-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-birthing-schedule.component.html',
  styleUrl: './add-birthing-schedule.component.scss'
})
export class AddBirthingScheduleComponent implements OnInit {
  animalId!: string;
  animalName: string = '';
  parentAnimal: Animal | null = null;

  newRecord: Partial<BirthingSchedule> = {};

  // Data for form dropdowns
  speciesOptions: BirthingSchedule['species'][] = ['Bovine', 'Equine', 'Capra hircus', 'Ovis aries'];
  calvingEaseOptions: string[] = ['Easy', 'Assisted', 'Hard Pull', 'Caesarean'];
  sexOptions: string[] = ['bull', 'heifer', 'colt', 'filly', 'doe', 'buck', 'ewe', 'ram', 'Unknown'];

  // Submission state to prevent duplicate submissions
  isSubmitting: boolean = false;


  constructor(
    private birthingService: BirthingService,
    private route: ActivatedRoute,
    private router: Router,
    private firestore: Firestore,
    private animalsService: AnimalsService
  ) { }

  ngOnInit(): void {
    this.animalId = this.route.snapshot.paramMap.get('id')!;
    this.loadAnimalInfo();

    // Set a default date to today for convenience
    this.newRecord.dob = new Date().toISOString().substring(0, 10);
    // Optionally, fetch the Dam's name (animalId) and set newRecord.dam
    this.newRecord.dam = this.animalId;
  }

  loadAnimalInfo() {
    this.animalsService.getAnimal(this.animalId).subscribe({
      next: (animal: Animal | undefined) => {
        if (animal) {
          this.animalName = animal.name;
          this.parentAnimal = animal;
        }
      },
      error: (error) => {
        console.error('Error loading animal info:', error);
      }
    });
  }

  // Map offspring sex to 'male' or 'female' for Animal model
  private mapSexToAnimalSex(sex: string): 'male' | 'female' {
    const maleSexes = ['bull', 'colt', 'buck', 'ram'];
    return maleSexes.includes(sex.toLowerCase()) ? 'male' : 'female';
  }

  // Parse birth weight string to number (if possible)
  private parseBirthWeight(birthWeight: string | null | undefined): number | undefined {
    if (!birthWeight) return undefined;
    const parsed = parseFloat(birthWeight);
    return isNaN(parsed) ? undefined : parsed;
  }

  // Helper to safely get string value, converting undefined/empty to null
  private getStringValue(value: unknown): string | null {
    if (value === undefined || value === null || value === '') {
      return null;
    }
    const str = String(value).trim();
    return str === '' ? null : str;
  }

  onSubmit(form: NgForm) {
    if (form.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    // Construct the DocumentReference to the parent Animal (Dam)
    const animalRef: DocumentReference = doc(
      this.firestore,
      `animals/${this.animalId}`
    );

    const formData = form.value;

    // Build record with explicit field handling
    // Firestore accepts null but NOT undefined
    const recordToAdd: BirthingSchedule = {
      // Required fields
      species: formData.species,
      dob: formData.dob,
      tagInfo: formData.tagInfo,
      sex: formData.sex,
      breed: formData.breed,
      dam: this.animalId,
      animalRef: animalRef,
      // Optional fields - use helper to ensure no undefined values
      sire: this.getStringValue(formData.sire),
      birthWeight: this.getStringValue(formData.birthWeight),
      calvingEase: this.getStringValue(formData.calvingEase),
      notes: this.getStringValue(formData.notes),
    };

    this.birthingService.addBirthingRecord(this.animalId, recordToAdd)
      .pipe(
        switchMap((birthingDocRef) => {
          // Create the new animal entry for the offspring
          const newAnimal: Animal = {
            tenantId: this.parentAnimal?.tenantId || '',
            name: formData.tagInfo,
            identifier: formData.tagInfo,
            species: formData.species,
            breed: formData.breed,
            dob: formData.dob,
            sex: this.mapSexToAnimalSex(formData.sex),
            status: 'active',
            damId: this.animalId,
            reproductiveStatus: 'unknown',
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now(),
          };

          // Add optional fields if provided
          if (formData.sire) {
            newAnimal.sireId = formData.sire;
          }
          const birthWeight = this.parseBirthWeight(formData.birthWeight);
          if (birthWeight !== undefined) {
            newAnimal.birthWeight = birthWeight;
            newAnimal.currentWeight = birthWeight;
          }

          // Inherit farm location from parent if available
          if (this.parentAnimal?.currentFarmId) {
            newAnimal.currentFarmId = this.parentAnimal.currentFarmId;
            if (this.parentAnimal.currentFarmName) {
              newAnimal.currentFarmName = this.parentAnimal.currentFarmName;
            }
          }

          return this.animalsService.addAnimal(newAnimal);
        })
      )
      .subscribe({
        next: (animalDocRef) => {
          console.log('Birthing record and animal entry added successfully!');
          this.isSubmitting = false;
          this.router.navigate(['/animals', this.animalId, 'birthing']);
        },
        error: (error) => {
          console.error('Error adding birthing record or animal:', error);
          this.isSubmitting = false;
          alert('Error adding birth record. Please try again.');
        }
      });
  }

  onCancel() {
    this.router.navigate(['/animals', this.animalId, 'birthing']);
  }
}