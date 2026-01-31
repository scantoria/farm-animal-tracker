// src/app/features/weight-record/components/add-weight-record/add-weight-record.component.ts
import { Component, OnInit } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { WeightRecordService, AddWeightData, WeightCalculations } from '../../../../core/services/weight-record.service';
import { AnimalsService } from '../../../../core/services/animals.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Animal } from '../../../../shared/models/animal.model';
import { GROWTH_CONSTANTS, getADGStatus } from '../../../../shared/models/weight-record.model';

@Component({
  selector: 'app-add-weight-record',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-weight-record.component.html',
  styleUrl: './add-weight-record.component.scss'
})
export class AddWeightRecordComponent implements OnInit {
  animalId!: string;
  animal?: Animal;
  animalName: string = '';

  // Form data
  weight?: number;
  weighDate: string = '';
  notes: string = '';

  // State
  isSubmitting: boolean = false;
  showResults: boolean = false;
  currentUserId: string = '';

  // Results after submission
  calculations?: WeightCalculations;

  constructor(
    private weightRecordService: WeightRecordService,
    private animalsService: AnimalsService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.animalId = id;
      this.weighDate = this.getTodayDate();
      this.loadAnimalInfo();
      this.loadCurrentUser();
    }
  }

  loadCurrentUser(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUserId = user.uid;
      }
    });
  }

  loadAnimalInfo(): void {
    this.animalsService.getAnimal(this.animalId).subscribe({
      next: (animal: Animal | undefined) => {
        if (animal) {
          this.animal = animal;
          this.animalName = animal.name;
        }
      },
      error: (error) => {
        console.error('Error loading animal info:', error);
      }
    });
  }

  onSubmit(form: NgForm): void {
    if (form.invalid || this.isSubmitting || !this.weight || !this.animal) {
      return;
    }

    this.isSubmitting = true;

    const weightData: AddWeightData = {
      animalId: this.animalId,
      weight: this.weight,
      weighDate: this.weighDate,
      notes: this.notes || undefined,
      createdBy: this.currentUserId,
      animalDob: this.animal.dob
    };

    this.weightRecordService.addWeightRecord(weightData).subscribe({
      next: (result) => {
        console.log('Weight record added successfully!', result);
        this.isSubmitting = false;
        this.calculations = result.calculations;
        this.showResults = true;
      },
      error: (error) => {
        console.error('Error adding weight record:', error);
        this.isSubmitting = false;
        alert('Error adding weight record. Please try again.');
      }
    });
  }

  onAddAnother(): void {
    this.showResults = false;
    this.weight = undefined;
    this.notes = '';
    this.weighDate = this.getTodayDate();
    this.calculations = undefined;
  }

  onDone(): void {
    this.router.navigate(['/animals', this.animalId, 'weight']);
  }

  onCancel(): void {
    this.router.navigate(['/animals', this.animalId, 'weight']);
  }

  getADGClass(adg: number): string {
    const status = getADGStatus(adg);
    return `adg-${status}`;
  }

  formatMonths(days: number): string {
    const months = Math.floor(days / 30);
    const remainingDays = days % 30;
    if (months === 0) return `${days} days`;
    if (remainingDays === 0) return `${months} months`;
    return `${months} mo ${remainingDays} days`;
  }

  get targetWeight(): number {
    return GROWTH_CONSTANTS.TARGET_SALE_WEIGHT;
  }

  private getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }
}
