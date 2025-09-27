// src/app/features/breeding/components/add-pregnancy-check/add-pregnancy-check.component.ts
import { Component, OnInit } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PregnancyCheck } from '../../../../shared/models/pregnancy-check.model';
import { BreedingService } from '../../../../core/services/breeding.service';
import { DocumentReference } from '@angular/fire/firestore';

@Component({
  selector: 'app-add-pregnancy-check',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-pregnancy-check.component.html',
  styleUrl: './add-pregnancy-check.component.scss'
})
export class AddPregnancyCheckComponent implements OnInit {
  animalId!: string;
  eventId!: string;
  
  // Hardcoding options for clarity and simplicity in the form
  checkResults: string[] = ['Pregnant', 'Open', 'Recheck Required'];
  checkMethods: string[] = ['Ultrasound', 'Blood Test', 'Palpation'];

  constructor(
    private breedingService: BreedingService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.animalId = this.route.snapshot.paramMap.get('id')!;
    this.eventId = this.route.snapshot.paramMap.get('eventId')!;
  }

  onSubmit(form: NgForm) {
    if (form.invalid) {
      return;
    }

    // Create a dummy DocumentReference for the foreign key.
    // In a full application, this would use a reference resolver.
    const breedingEventRef = { id: this.eventId } as DocumentReference;

    const newCheck: PregnancyCheck = {
      ...form.value,
      breedingEventRef: breedingEventRef, 
    };

    this.breedingService.addPregnancyCheck(this.animalId, this.eventId, newCheck)
      .subscribe({
        next: () => {
          console.log('Pregnancy check added successfully!');
          this.router.navigate(['/animals', this.animalId, 'breeding', this.eventId, 'checks']);
        },
        error: (error) => {
          console.error('Error adding pregnancy check:', error);
        },
      });
  }

  onCancel() {
    this.router.navigate(['/animals', this.animalId, 'breeding', this.eventId, 'checks']);
  }
}