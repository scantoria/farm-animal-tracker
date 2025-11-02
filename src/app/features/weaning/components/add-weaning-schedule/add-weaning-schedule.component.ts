import { Component, OnInit } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Firestore, doc, DocumentReference } from '@angular/fire/firestore';
import { WeaningSchedule } from '../../../../shared/models/weaning-schedule.model';
import { WeaningService } from '../../../../core/services/weaning.service';
import { AnimalsService } from '../../../../core/services/animals.service';
import { Animal } from '../../../../shared/models/animal.model';

@Component({
  selector: 'app-add-weaning-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-weaning-schedule.component.html',
  styleUrl: './add-weaning-schedule.component.scss'
})
export class AddWeaningScheduleComponent implements OnInit {
  animalId!: string;
  animalName: string = '';
  newRecord: Partial<WeaningSchedule> = {};

  // Data for form dropdowns
  methodOptions: string[] = ['Abrupt', 'Fence-line', 'Two-stage', 'Creep Weaning'];

  constructor(
    private weaningService: WeaningService,
    private route: ActivatedRoute,
    private router: Router,
    private firestore: Firestore,
    private animalsService: AnimalsService
  ) { }

  ngOnInit(): void {
    // Get the ID of the animal being weaned (the offspring)
    this.animalId = this.route.snapshot.paramMap.get('id')!;
    this.loadAnimalInfo();

    // Set a default date to today for convenience
    this.newRecord.weanDate = new Date().toISOString().substring(0, 10);
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
    
    // Construct the DocumentReference to the Animal being weaned
    const animalRef: DocumentReference = doc(
      this.firestore, 
      `animals/${this.animalId}`
    );

    const recordToAdd: WeaningSchedule = {
      ...form.value,
      animalRef: animalRef,
    };

    this.weaningService.addWeaningRecord(this.animalId, recordToAdd)
      .subscribe({
        next: () => {
          console.log('Weaning record added successfully!');
          // Navigate back to the list view
          this.router.navigate(['/animals', this.animalId, 'weaning']);
        },
        error: (error) => {
          console.error('Error adding weaning record:', error);
        }
      });
  }

  onCancel() {
    this.router.navigate(['/animals', this.animalId, 'weaning']);
  }
}