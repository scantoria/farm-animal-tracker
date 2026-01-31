// src/app/features/growth-tracking/components/growth-dashboard/growth-dashboard.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { GrowthTrackingService, CalfGrowthSummary, GrowthDashboardFilters } from '../../../../core/services/growth-tracking.service';
import { GrowthStatus } from '../../../../shared/models/animal.model';
import { CalfCardComponent } from '../calf-card/calf-card.component';

@Component({
  selector: 'app-growth-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, CalfCardComponent],
  templateUrl: './growth-dashboard.component.html',
  styleUrl: './growth-dashboard.component.scss'
})
export class GrowthDashboardComponent implements OnInit {
  summaries$!: Observable<CalfGrowthSummary[]>;
  summaries: CalfGrowthSummary[] = [];

  // Dashboard Stats
  stats = {
    totalActive: 0,
    totalReadyForSale: 0,
    totalSold: 0,
    averageADG: 0
  };

  // Filters
  statusFilter: GrowthStatus | 'all' = 'active';
  sexFilter: 'male' | 'female' | 'all' = 'all';
  sortBy: 'age' | 'weight' | 'adg' | 'saleReadiness' = 'saleReadiness';

  // State
  isLoading: boolean = true;

  constructor(
    private growthTrackingService: GrowthTrackingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadStats();
    this.loadSummaries();
  }

  loadStats(): void {
    this.growthTrackingService.getDashboardStats().subscribe({
      next: (stats) => {
        this.stats = stats;
      },
      error: (error) => console.error('Error loading stats:', error)
    });
  }

  loadSummaries(): void {
    this.isLoading = true;
    const filters: GrowthDashboardFilters = {
      status: this.statusFilter,
      sex: this.sexFilter,
      sortBy: this.sortBy,
      sortDirection: 'asc'
    };

    this.growthTrackingService.getAllCalfGrowthSummaries(filters).subscribe({
      next: (summaries) => {
        this.summaries = summaries;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading summaries:', error);
        this.isLoading = false;
      }
    });
  }

  onFilterChange(): void {
    this.loadSummaries();
  }

  onViewDetails(animalId: string): void {
    this.router.navigate(['/growth-tracking', 'calf', animalId]);
  }

  onAddWeight(animalId: string): void {
    this.router.navigate(['/animals', animalId, 'weight', 'add']);
  }

  trackBySummary(index: number, summary: CalfGrowthSummary): string {
    return summary.animal.id || index.toString();
  }
}
