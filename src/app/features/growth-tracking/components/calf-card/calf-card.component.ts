// src/app/features/growth-tracking/components/calf-card/calf-card.component.ts
import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CalfGrowthSummary } from '../../../../core/services/growth-tracking.service';
import { ADGBadgeComponent } from '../adg-badge/adg-badge.component';
import { GROWTH_CONSTANTS } from '../../../../shared/models/weight-record.model';

@Component({
  selector: 'app-calf-card',
  standalone: true,
  imports: [CommonModule, RouterModule, ADGBadgeComponent],
  templateUrl: './calf-card.component.html',
  styleUrl: './calf-card.component.scss'
})
export class CalfCardComponent {
  @Input() summary!: CalfGrowthSummary;
  @Output() viewDetails = new EventEmitter<string>();
  @Output() addWeight = new EventEmitter<string>();

  get currentWeight(): number {
    return this.summary.latestWeight?.weight || this.summary.animal.currentWeight || 0;
  }

  get lastWeighDate(): any {
    return this.summary.latestWeight?.weighDate || this.summary.animal.lastWeighDate;
  }

  get targetWeight(): number {
    return GROWTH_CONSTANTS.TARGET_SALE_WEIGHT;
  }

  formatMonths(days: number): string {
    const months = Math.floor(days / 30);
    const remainingDays = days % 30;
    if (months === 0) return `${days}d`;
    if (remainingDays === 0) return `${months}mo`;
    return `${months}mo ${remainingDays}d`;
  }

  formatDate(date: any): Date {
    if (date?.toDate) {
      return date.toDate();
    }
    return new Date(date);
  }

  onViewDetails(): void {
    if (this.summary.animal.id) {
      this.viewDetails.emit(this.summary.animal.id);
    }
  }

  onAddWeight(): void {
    if (this.summary.animal.id) {
      this.addWeight.emit(this.summary.animal.id);
    }
  }
}
