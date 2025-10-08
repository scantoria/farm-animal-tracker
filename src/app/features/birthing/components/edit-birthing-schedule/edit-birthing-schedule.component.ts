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

  onSubmit(form: NgForm) {
    if (form.invalid || !this.birthingRecord?.id) {
      return;
    }

    // Exclude the DocumentReference from the update payload
    const { animalRef, ...updates } = form.value;

    const updatedRecord: Partial<BirthingSchedule> = {
      ...updates,
    };

    this.birthingService.updateBirthingRecord(this.animalId, this.birthingRecord.id, updatedRecord)
      .subscribe({
        next: () => {
          console.log('Birthing record updated successfully!');
          this.router.navigate(['/animals', this.animalId, 'birthing']);
        },
        error: (error) => {
          console.error('Error updating birthing record:', error);
        }
      });
  }

  onCancel() {
    this.router.navigate(['/animals', this.animalId, 'birthing']);
  }
}