import { Component, OnInit } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { WeaningSchedule } from '../../../../shared/models/weaning-schedule.model';
import { WeaningService } from '../../../../core/services/weaning.service';

@Component({
  selector: 'app-edit-weaning-schedule',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-weaning-schedule.component.html',
  styleUrl: './edit-weaning-schedule.component.scss'
})
export class EditWeaningScheduleComponent implements OnInit {
  animalId!: string;
  recordId!: string;
  weaningRecord: WeaningSchedule | undefined;

  methodOptions: string[] = ['Abrupt', 'Fence-line', 'Two-stage', 'Creep Weaning'];

  constructor(
    private weaningService: WeaningService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.animalId = this.route.snapshot.paramMap.get('id')!;
    this.recordId = this.route.snapshot.paramMap.get('recordId')!;

    if (this.animalId && this.recordId) {
      this.weaningService.getWeaningRecord(this.animalId, this.recordId)
        .subscribe(record => {
          this.weaningRecord = record;
        });
    }
  }

  onSubmit(form: NgForm) {
    if (form.invalid || !this.weaningRecord?.id) {
      return;
    }

    // Exclude the DocumentReference from the update payload
    const { animalRef, ...updates } = form.value;

    const updatedRecord: Partial<WeaningSchedule> = {
      ...updates,
    };

    this.weaningService.updateWeaningRecord(this.animalId, this.weaningRecord.id, updatedRecord)
      .subscribe({
        next: () => {
          console.log('Weaning record updated successfully!');
          this.router.navigate(['/animals', this.animalId, 'weaning']);
        },
        error: (error) => {
          console.error('Error updating weaning record:', error);
        }
      });
  }

  onCancel() {
    this.router.navigate(['/animals', this.animalId, 'weaning']);
  }
}