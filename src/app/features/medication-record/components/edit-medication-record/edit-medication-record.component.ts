import { Component, OnInit } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Firestore, doc, DocumentReference } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

// Update paths to your actual files
import { MedicationRecord } from '../../../../shared/models/medication-record.model'; 
import { Veterinarian } from '../../../../shared/models/veterinarian.model';
import { MedicationService } from '../../../../core/services/medication.service';
import { VeterinarianDataService } from '../../../../core/services/veterinarian-data.service';

@Component({
  selector: 'app-edit-medication-record',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-medication-record.component.html',
  styleUrl: './edit-medication-record.component.scss'
})
export class EditMedicationRecordComponent implements OnInit {
  animalId!: string;
  recordId!: string;
  
  // Model to hold form data. Will be pre-filled with existing data.
  recordData: Partial<MedicationRecord> = {}; 
  
  veterinarians$!: Observable<Veterinarian[]>; 
  treatmentTypes: string[] = [
    'Vaccination', 'Deworming', 'Injury Treatment', 
    'Routine Checkup', 'Dental', 'Other'
  ];

  constructor(
    private medicationService: MedicationService,
    private vetDataService: VeterinarianDataService,
    private route: ActivatedRoute,
    private router: Router,
    private firestore: Firestore 
  ) { }

  ngOnInit(): void {
    // 1. Get IDs from the route
    this.animalId = this.route.snapshot.paramMap.get('id')!;
    this.recordId = this.route.snapshot.paramMap.get('recordId')!;

    this.loadVeterinarians();
      
    // 2. Fetch the existing record data
    if (this.animalId && this.recordId) {
      this.medicationService.getRecord(this.animalId, this.recordId)
        .subscribe(record => {
          // Assign the fetched record to the model to populate the form
          this.recordData = record;
        });
    }
  }
  
  loadVeterinarians() {
    this.veterinarians$ = this.vetDataService.getAllVeterinarians();
  }

  onSubmit(form: NgForm) {
    if (form.invalid || !this.recordId) {
      console.log('Form is invalid or Record ID is missing.');
      return;
    }
    
    // 1. Create DocumentReference for the animal
    const animalRef: DocumentReference = doc(this.firestore, `animals/${this.animalId}`);

    // 2. Construct the updated record object (using Partial to avoid sending 'id' and 'animalRef' if unnecessary, 
    // but we include them here for completeness)
    const updatedRecord: Partial<MedicationRecord> = {
      ...form.value,
      animalRef: animalRef,
    };

    // 3. Update the record
    // NOTE: This relies on the 'updateRecord' method being in the service (Step 3).
    this.medicationService.updateRecord(this.animalId, this.recordId, updatedRecord)
      .subscribe({
        next: () => {
          console.log('Medication record updated successfully!');
          // Navigate back to the list
          this.router.navigate(['/animals', this.animalId, 'medication']);
        },
        error: (error) => {
          console.error('Error updating medication record:', error);
        }
      });
  }

  onCancel() {
    this.router.navigate(['/animals', this.animalId, 'medication']);
  }
}