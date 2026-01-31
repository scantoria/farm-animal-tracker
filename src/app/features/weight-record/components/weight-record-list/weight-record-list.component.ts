// src/app/features/weight-record/components/weight-record-list/weight-record-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { WeightRecord, GROWTH_CONSTANTS, getADGStatus, ADGStatus } from '../../../../shared/models/weight-record.model';
import { Animal } from '../../../../shared/models/animal.model';
import { WeightRecordService } from '../../../../core/services/weight-record.service';
import { AnimalsService } from '../../../../core/services/animals.service';

@Component({
  selector: 'app-weight-record-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './weight-record-list.component.html',
  styleUrl: './weight-record-list.component.scss'
})
export class WeightRecordListComponent implements OnInit {
  weightRecords$!: Observable<WeightRecord[]>;
  animalId!: string;
  animal?: Animal;
  animalName: string = '';

  // Growth summary
  currentWeight: number = 0;
  daysOld: number = 0;
  averageADG: number = 0;
  daysToSaleWeight: number | null = null;
  isSaleReady: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private weightRecordService: WeightRecordService,
    private animalsService: AnimalsService
  ) {}

  ngOnInit(): void {
    this.animalId = this.route.snapshot.paramMap.get('id')!;
    if (this.animalId) {
      this.loadAnimalInfo();
      this.loadWeightRecords();
    }
  }

  loadAnimalInfo(): void {
    this.animalsService.getAnimal(this.animalId).subscribe({
      next: (animal: Animal | undefined) => {
        if (animal) {
          this.animal = animal;
          this.animalName = animal.name;
          this.currentWeight = animal.currentWeight || 0;
          this.averageADG = animal.averageADG || 0;
          this.daysOld = this.calculateDaysOld(animal.dob);
          this.isSaleReady = this.currentWeight >= GROWTH_CONSTANTS.SALE_READY_WEIGHT;
          this.daysToSaleWeight = this.calculateDaysToTarget();
        }
      },
      error: (error) => {
        console.error('Error loading animal info:', error);
      }
    });
  }

  loadWeightRecords(): void {
    this.weightRecords$ = this.weightRecordService.getWeightRecordsByAnimalId(this.animalId);
  }

  trackByRecordId(index: number, record: WeightRecord): string {
    return record.id || index.toString();
  }

  onAddWeight(): void {
    this.router.navigate(['/animals', this.animalId, 'weight', 'add']);
  }

  onEdit(recordId: string): void {
    this.router.navigate(['/animals', this.animalId, 'weight', 'edit', recordId]);
  }

  onDelete(recordId: string): void {
    if (confirm('Are you sure you want to delete this weight record?')) {
      this.weightRecordService.deleteWeightRecord(this.animalId, recordId).subscribe({
        next: () => {
          console.log('Weight record deleted successfully!');
          this.loadWeightRecords();
          this.loadAnimalInfo(); // Refresh animal stats
        },
        error: (error) => {
          console.error('Error deleting weight record:', error);
        }
      });
    }
  }

  getADGStatus(adg: number): ADGStatus {
    return getADGStatus(adg);
  }

  getADGClass(adg: number): string {
    const status = getADGStatus(adg);
    return `adg-${status}`;
  }

  formatDate(date: any): Date {
    if (date?.toDate) {
      return date.toDate();
    }
    return new Date(date);
  }

  private calculateDaysOld(dob: any): number {
    const dobDate = dob?.toDate ? dob.toDate() : new Date(dob);
    const today = new Date();
    const diffTime = today.getTime() - dobDate.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  private calculateDaysToTarget(): number | null {
    if (this.currentWeight >= GROWTH_CONSTANTS.TARGET_SALE_WEIGHT) return 0;
    if (this.averageADG <= 0) return null;
    return Math.ceil((GROWTH_CONSTANTS.TARGET_SALE_WEIGHT - this.currentWeight) / this.averageADG);
  }

  formatMonths(days: number): string {
    const months = Math.floor(days / 30);
    const remainingDays = days % 30;
    if (months === 0) return `${days} days`;
    if (remainingDays === 0) return `${months} mo`;
    return `${months} mo ${remainingDays} days`;
  }
}
