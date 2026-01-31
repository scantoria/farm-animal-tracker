// src/app/features/weight-record/components/edit-weight-record/edit-weight-record.component.ts
import { Component, OnInit } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { WeightRecordService } from '../../../../core/services/weight-record.service';
import { AnimalsService } from '../../../../core/services/animals.service';
import { WeightRecord } from '../../../../shared/models/weight-record.model';

@Component({
  selector: 'app-edit-weight-record',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-weight-record.component.html',
  styleUrl: './edit-weight-record.component.scss'
})
export class EditWeightRecordComponent implements OnInit {
  animalId!: string;
  recordId!: string;
  animalName: string = '';

  // Form data
  weight?: number;
  weighDate: string = '';
  notes: string = '';

  // Original record
  record?: WeightRecord;

  // State
  isLoading: boolean = true;
  isSubmitting: boolean = false;

  constructor(
    private weightRecordService: WeightRecordService,
    private animalsService: AnimalsService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.animalId = this.route.snapshot.paramMap.get('id')!;
    this.recordId = this.route.snapshot.paramMap.get('recordId')!;

    if (this.animalId && this.recordId) {
      this.loadData();
    }
  }

  loadData(): void {
    // Load animal info
    this.animalsService.getAnimal(this.animalId).subscribe({
      next: (animal) => {
        if (animal) {
          this.animalName = animal.name;
        }
      },
      error: (error) => console.error('Error loading animal:', error)
    });

    // Load weight record
    this.weightRecordService.getWeightRecord(this.animalId, this.recordId).subscribe({
      next: (record) => {
        this.record = record;
        this.weight = record.weight;
        this.weighDate = this.toDateString(record.weighDate);
        this.notes = record.notes || '';
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading weight record:', error);
        this.isLoading = false;
      }
    });
  }

  onSubmit(form: NgForm): void {
    if (form.invalid || this.isSubmitting || !this.weight) {
      return;
    }

    this.isSubmitting = true;

    const updates: Partial<WeightRecord> = {
      weight: this.weight,
      weighDate: this.weighDate,
      notes: this.notes || undefined
    };

    this.weightRecordService.updateWeightRecord(this.animalId, this.recordId, updates).subscribe({
      next: () => {
        console.log('Weight record updated successfully!');
        this.isSubmitting = false;
        this.router.navigate(['/animals', this.animalId, 'weight']);
      },
      error: (error) => {
        console.error('Error updating weight record:', error);
        this.isSubmitting = false;
        alert('Error updating weight record. Please try again.');
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/animals', this.animalId, 'weight']);
  }

  private toDateString(value: any): string {
    if (!value) return '';
    if (value.toDate) {
      return value.toDate().toISOString().split('T')[0];
    }
    return new Date(value).toISOString().split('T')[0];
  }
}
