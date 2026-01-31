// src/app/features/growth-tracking/components/calf-detail/calf-detail.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { GrowthTrackingService, CalfGrowthSummary, SaleData } from '../../../../core/services/growth-tracking.service';
import { WeightRecordService } from '../../../../core/services/weight-record.service';
import { WeightRecord, GROWTH_CONSTANTS } from '../../../../shared/models/weight-record.model';
import { ADGBadgeComponent } from '../adg-badge/adg-badge.component';
import { GrowthChartComponent } from '../growth-chart/growth-chart.component';

@Component({
  selector: 'app-calf-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, ADGBadgeComponent, GrowthChartComponent],
  templateUrl: './calf-detail.component.html',
  styleUrl: './calf-detail.component.scss'
})
export class CalfDetailComponent implements OnInit {
  animalId!: string;
  summary?: CalfGrowthSummary;
  weightRecords: WeightRecord[] = [];

  isLoading: boolean = true;
  showSaleModal: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private growthTrackingService: GrowthTrackingService,
    private weightRecordService: WeightRecordService
  ) {}

  ngOnInit(): void {
    this.animalId = this.route.snapshot.paramMap.get('id')!;
    if (this.animalId) {
      this.loadData();
    }
  }

  loadData(): void {
    this.isLoading = true;

    // Load growth summary
    this.growthTrackingService.getCalfGrowthSummary(this.animalId).subscribe({
      next: (summary) => {
        this.summary = summary;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading summary:', error);
        this.isLoading = false;
      }
    });

    // Load weight records for chart
    this.weightRecordService.getWeightRecordsByAnimalId(this.animalId).subscribe({
      next: (records) => {
        this.weightRecords = records;
      },
      error: (error) => console.error('Error loading weight records:', error)
    });
  }

  get currentWeight(): number {
    return this.summary?.latestWeight?.weight || this.summary?.animal.currentWeight || 0;
  }

  get targetWeight(): number {
    return GROWTH_CONSTANTS.TARGET_SALE_WEIGHT;
  }

  formatMonths(days: number): string {
    const months = Math.floor(days / 30);
    const remainingDays = days % 30;
    if (months === 0) return `${days} days`;
    if (remainingDays === 0) return `${months} months`;
    return `${months} mo ${remainingDays} days`;
  }

  formatDate(date: any): Date {
    if (date?.toDate) {
      return date.toDate();
    }
    return new Date(date);
  }

  onAddWeight(): void {
    this.router.navigate(['/animals', this.animalId, 'weight', 'add']);
  }

  onViewWeightHistory(): void {
    this.router.navigate(['/animals', this.animalId, 'weight']);
  }

  onViewAnimal(): void {
    this.router.navigate(['/edit-animal', this.animalId]);
  }

  onMarkAsSold(): void {
    if (!this.summary) return;

    const saleDate = prompt('Enter sale date (YYYY-MM-DD):', new Date().toISOString().split('T')[0]);
    if (!saleDate) return;

    const saleWeightStr = prompt('Enter sale weight (lbs):', this.currentWeight.toString());
    const saleWeight = saleWeightStr ? parseFloat(saleWeightStr) : undefined;

    const salePriceStr = prompt('Enter sale price ($):', '');
    const salePrice = salePriceStr ? parseFloat(salePriceStr) : undefined;

    const saleData: SaleData = {
      saleDate,
      saleWeight,
      salePrice
    };

    this.growthTrackingService.markCalfAsSold(this.animalId, saleData).subscribe({
      next: () => {
        alert('Calf marked as sold!');
        this.loadData();
      },
      error: (error) => {
        console.error('Error marking as sold:', error);
        alert('Error updating sale status.');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/growth-tracking']);
  }
}
