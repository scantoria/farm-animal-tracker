import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HealthService } from '../../../../core/services/health.service';
import { HealthModel } from '../../../../shared/models/health.model';
import { AnimalsService } from '../../../../core/services/animals.service';
import { Animal } from '../../../../shared/models/animal.model';
import { take } from 'rxjs/operators';


@Component({
  selector: 'app-edit-health',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './edit-health.component.html',
  styleUrls: ['./edit-health.component.scss'],
})
export class EditHealthComponent implements OnInit {
  editHealthRecordForm!: FormGroup;
  recordId!: string;
  animalId!: string;
  animalName: string = '';

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private healthService: HealthService,
    private animalsService: AnimalsService
  ) {
    this.editHealthRecordForm = this.fb.group({
      date: ['', Validators.required],
      eventType: ['', Validators.required],
      description: ['', Validators.required],
      // Add other fields from your HealthModel as needed
    });
  }

  ngOnInit(): void {
    this.animalId = this.route.snapshot.paramMap.get('id')!;
    this.recordId = this.route.snapshot.paramMap.get('recordId')!;

    this.editHealthRecordForm = this.fb.group({
      date: ['', Validators.required],
      eventType: ['', Validators.required],
      description: [''],
      administeredBy: ['', Validators.required],
      dosage: [''],
    });

    if (this.animalId && this.recordId) {
      this.loadAnimalInfo();
      this.healthService
        .getHealthRecord(this.animalId, this.recordId)
        .pipe(take(1))
        .subscribe((record: HealthModel) => {
          if (record) {
            this.editHealthRecordForm.patchValue(record);
          }
        });
    }
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

  onSubmit() {
    if (this.editHealthRecordForm.valid && this.animalId && this.recordId) {
      this.healthService
        .updateHealthRecord(
          this.animalId, 
          this.recordId, 
          this.editHealthRecordForm.value
        )
        .subscribe(() => {
          console.log('Health record updated successfully!');
          this.router.navigate(['/animals', this.animalId, 'health']);
        });
    }
  }

  onCancel() {
    this.router.navigate(['/animals', this.animalId, 'health']);
  }
}