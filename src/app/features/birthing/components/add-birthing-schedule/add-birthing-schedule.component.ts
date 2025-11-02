import { Component, OnInit } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Firestore, doc, DocumentReference } from '@angular/fire/firestore';
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

  newRecord: Partial<BirthingSchedule> = {};

  // Data for form dropdowns
  speciesOptions: BirthingSchedule['species'][] = ['Bovine', 'Equine', 'Capra hircus', 'Ovis aries'];
  calvingEaseOptions: string[] = ['Easy', 'Assisted', 'Hard Pull', 'Caesarean'];
  sexOptions: string[] = ['bull', 'heifer', 'colt', 'filly', 'doe', 'buck', 'ewe', 'ram', 'Unknown'];


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
        }
      },
      error: (error) => {
        console.error('Error loading animal info:', error);
      }
    });
  }

  onSubmit(form: NgForm) {
    if (form.invalid) {
      return;
    }
    
    // Construct the DocumentReference to the parent Animal (Dam)
    const animalRef: DocumentReference = doc(
      this.firestore, 
      `animals/${this.animalId}`
    );

    const recordToAdd: BirthingSchedule = {
      ...form.value,
      animalRef: animalRef,
    };

    this.birthingService.addBirthingRecord(this.animalId, recordToAdd)
      .subscribe({
        next: () => {
          console.log('Birthing record added successfully!');
          // Navigate back to the list view
          this.router.navigate(['/animals', this.animalId, 'birthing']);
        },
        error: (error) => {
          console.error('Error adding birthing record:', error);
        }
      });
  }

  onCancel() {
    this.router.navigate(['/animals', this.animalId, 'birthing']);
  }
}