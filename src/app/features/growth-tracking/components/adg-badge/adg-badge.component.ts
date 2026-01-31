// src/app/features/growth-tracking/components/adg-badge/adg-badge.component.ts
import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { getADGStatus, ADGStatus, GROWTH_CONSTANTS } from '../../../../shared/models/weight-record.model';

@Component({
  selector: 'app-adg-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span class="adg-badge" [ngClass]="'adg-' + status" [title]="tooltip">
      {{ adg | number:'1.2-2' }}
      <small *ngIf="showUnit">lbs/day</small>
    </span>
  `,
  styles: [`
    .adg-badge {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.875rem;
      font-weight: 700;

      small {
        font-size: 0.6875rem;
        font-weight: 500;
        opacity: 0.8;
      }

      &.adg-good {
        background-color: #dcfce7;
        color: #166534;
      }

      &.adg-warning {
        background-color: #fef9c3;
        color: #854d0e;
      }

      &.adg-poor {
        background-color: #fecaca;
        color: #b91c1c;
      }
    }
  `]
})
export class ADGBadgeComponent {
  @Input() adg: number = 0;
  @Input() showUnit: boolean = true;

  get status(): ADGStatus {
    return getADGStatus(this.adg);
  }

  get tooltip(): string {
    const target = GROWTH_CONSTANTS.TARGET_ADG;
    if (this.status === 'good') {
      return `Excellent! Meeting or exceeding ${target} lbs/day target`;
    } else if (this.status === 'warning') {
      return `Below target of ${target} lbs/day`;
    }
    return `Needs attention - significantly below ${target} lbs/day target`;
  }
}
