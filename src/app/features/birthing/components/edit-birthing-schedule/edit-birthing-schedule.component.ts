import { Component, OnInit } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BirthingSchedule } from '../../../../shared/models/birthing-schedule.model';
import { BirthingService } from '../../../../core/services/birthing.service';

@Component({
  selector: 'app-edit-birthing-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-birthing-schedule.component.html',
  styleUrl: './edit-birthing-schedule.component.scss'
})
export class EditBirthingScheduleComponent implements OnInit {
  animalId!: string;
  recordId!: string;
  birthingRecord: BirthingSchedule | undefined;

  // Data for form dropdowns (replicated from Add component)
  speciesOptions: BirthingSchedule['species'][] = ['Bovine', 'Equine', 'Capra hircus', 'Ovis aries'];
  calvingEaseOptions: string[] = ['Easy', 'Assisted', 'Hard Pull', 'Caesarean'];
  sexOptions: string[] = ['bull', 'heifer', 'colt', 'filly', 'doe', 'buck', 'ewe', 'ram', 'Unknown'];

  // Submission state to prevent duplicate submissions
  isSubmitting: boolean = false;

  constructor(
    private birthingService: BirthingService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.animalId = this.route.snapshot.paramMap.get('id')!;
    this.recordId = this.route.snapshot.paramMap.get('recordId')!;

    if (this.animalId && this.recordId) {
      this.birthingService.getBirthingRecord(this.animalId, this.recordId)
        .subscribe(record => {
          this.birthingRecord = record;
        });
    }
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
    if (form.invalid || !this.birthingRecord?.id || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    // Exclude the DocumentReference from the update payload
    const { animalRef, ...formData } = form.value;

    // Build update with explicit field handling
    // Firestore accepts null but NOT undefined
    const updatedRecord: Partial<BirthingSchedule> = {
      // Required fields
      species: formData.species,
      dob: formData.dob,
      tagInfo: formData.tagInfo,
      sex: formData.sex,
      breed: formData.breed,
      dam: formData.dam,
      // Optional fields - use helper to ensure no undefined values
      sire: this.getStringValue(formData.sire),
      birthWeight: this.getStringValue(formData.birthWeight),
      calvingEase: this.getStringValue(formData.calvingEase),
      notes: this.getStringValue(formData.notes),
    };

    this.birthingService.updateBirthingRecord(this.animalId, this.birthingRecord.id, updatedRecord)
      .subscribe({
        next: () => {
          console.log('Birthing record updated successfully!');
          this.isSubmitting = false;
          this.router.navigate(['/animals', this.animalId, 'birthing']);
        },
        error: (error) => {
          console.error('Error updating birthing record:', error);
          this.isSubmitting = false;
          alert('Error updating birth record. Please try again.');
        }
      });
  }

  onCancel() {
    this.router.navigate(['/animals', this.animalId, 'birthing']);
  }
}