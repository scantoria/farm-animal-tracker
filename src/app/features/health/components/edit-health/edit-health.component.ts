import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HealthService } from '../../../../core/services/health.service'; // Corrected path
import { HealthModel } from '../../../../shared/models/health.model'; // Corrected path
import { take } from 'rxjs/operators';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-edit-health',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './edit-health.component.html',
  styleUrls: ['./edit-health.component.scss'],
})
export class EditHealthComponent implements OnInit {
  editHealthForm!: FormGroup;
  recordId!: string;
  animalId!: string;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private healthService: HealthService
  ) {}

  ngOnInit(): void {
    this.animalId = this.route.snapshot.paramMap.get('id')!;
    this.recordId = this.route.snapshot.paramMap.get('recordId')!;

    this.editHealthForm = this.fb.group({
      date: ['', Validators.required],
      eventType: ['', Validators.required],
      description: ['', Validators.required],
      administeredBy: ['', Validators.required],
      dosage: [''],
    });

    if (this.recordId) {
      this.healthService
        .getHealthRecord(this.animalId, this.recordId)
        .pipe(take(1))
        .subscribe((record: HealthModel) => {
          this.editHealthForm.patchValue(record);
        });
    }
  }

  onSubmit() {
    if (this.editHealthForm.valid && this.recordId) {
      this.healthService
        .updateHealthRecord(
          this.animalId,
          this.recordId,
          this.editHealthForm.value
        )
        .subscribe(() => {
          console.log('Health record updated successfully!');
          this.router.navigate(['/animals', this.animalId, 'health-records']);
        });
    }
  }

  onCancel() {
    this.router.navigate(['/animals', this.animalId, 'health-records']);
  }
}