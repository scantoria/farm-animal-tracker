// src/app/features/medication/components/add-medication-record/add-medication-record.component.ts

import { Component, OnInit } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Firestore, doc, DocumentReference } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

import { MedicationRecord } from '../../../../shared/models/medication-record.model';
import { Veterinarian } from '../../../../shared/models/veterinarian.model';
import { MedicationService } from '../../../../core/services/medication.service';
import { VeterinarianDataService } from '../../../../core/services/veterinarian-data.service';
import { AnimalsService } from '../../../../core/services/animals.service';
import { Animal } from '../../../../shared/models/animal.model';


@Component({
  selector: 'app-add-medication-record',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-medication-record.component.html',
  styleUrl: './add-medication-record.component.scss'
})
export class AddMedicationRecordComponent implements OnInit {
  animalId!: string;
  animalName: string = '';
  recordData: Partial<MedicationRecord> = {};
  veterinarians$!: Observable<Veterinarian[]>;
  treatmentTypes: string[] = ['Vaccination', 'Deworming', 'Antibiotics', 'Injury Treatment'];


  constructor(
    private medicationService: MedicationService,
    private vetDataService: VeterinarianDataService,
    private route: ActivatedRoute,
    private router: Router,
    private firestore: Firestore,
    private animalsService: AnimalsService
  ) { }

  ngOnInit(): void {
    this.animalId = this.route.snapshot.paramMap.get('id')!;
    this.loadAnimalInfo();
    this.loadVeterinarians();
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

  loadVeterinarians() {
    this.veterinarians$ = this.vetDataService.getAllVeterinarians();
  }

  onSubmit(form: NgForm) {
    if (form.invalid) {
      console.log('Form is invalid. Errors:', form.controls);
      return;
    }

    const animalRef: DocumentReference = doc(this.firestore, `animals/${this.animalId}`);
    const newRecord: MedicationRecord = {
      ...form.value,
      animalRef: animalRef
      //id: undefined 
    } as MedicationRecord;

    this.medicationService.addRecord(this.animalId, newRecord)
      .subscribe({
        next: () => {
          console.log('Medication record added successfully!');
          this.router.navigate(['/animals', this.animalId, 'medication-record']); 
        },
        error: (error) => {
          console.error('Error adding medication record:', error);
        }
      });
  }

  onCancel() {
    this.router.navigate(['/animals', this.animalId, 'medication-record']);
  }
}