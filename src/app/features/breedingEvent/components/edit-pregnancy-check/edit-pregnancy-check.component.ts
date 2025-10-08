// src/app/features/breeding/components/edit-pregnancy-check/edit-pregnancy-check.component.ts
import { Component, OnInit } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { PregnancyCheck } from '../../../../shared/models/pregnancy-check.model';
import { BreedingService } from '../../../../core/services/breeding.service';

@Component({
  selector: 'app-edit-pregnancy-check',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-pregnancy-check.component.html',
  styleUrl: './edit-pregnancy-check.component.scss'
})
export class EditPregnancyCheckComponent implements OnInit {
  animalId!: string;
  eventId!: string;
  checkId!: string;
  pregnancyCheck: PregnancyCheck | undefined;

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
    this.checkId = this.route.snapshot.paramMap.get('checkId')!;

    if (this.animalId && this.eventId && this.checkId) {
      this.breedingService.getPregnancyCheck(this.animalId, this.eventId, this.checkId).subscribe(check => {
        if (check) {
          this.pregnancyCheck = check;
          // The date (e.g., check.checkDate) is assumed to be a string (YYYY-MM-DD) 
          // and is bound directly to the input type="date" field in the HTML.
        } else {
          // Handle case where check is not found (optional)
          console.error('Pregnancy check not found.');
          this.router.navigate(['/animals', this.animalId, 'breeding', this.eventId, 'checks']);
        }
      }); 
    }
  }

  onSubmit(form: NgForm) {
    if (form.invalid || !this.pregnancyCheck) {
      return;
    }

    const updatedCheck: Partial<PregnancyCheck> = {
      ...form.value,
      // Date is already a string from the input, no conversion needed.
    };

    this.breedingService.updatePregnancyCheck(this.animalId, this.eventId, this.checkId, updatedCheck)
      .subscribe({
        next: () => {
          console.log('Pregnancy check updated successfully!');
          this.router.navigate(['/animals', this.animalId, 'breeding', this.eventId, 'checks']);
        },
        error: (error) => {
          console.error('Error updating pregnancy check:', error);
        },
      });
  }

  onCancel() {
    this.router.navigate(['/animals', this.animalId, 'breeding', this.eventId, 'checks']);
  }
}