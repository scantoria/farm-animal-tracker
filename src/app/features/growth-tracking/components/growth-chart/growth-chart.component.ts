// src/app/features/growth-tracking/components/growth-chart/growth-chart.component.ts
import { Component, Input, OnChanges, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { WeightRecord, GROWTH_CONSTANTS } from '../../../../shared/models/weight-record.model';

@Component({
  selector: 'app-growth-chart',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  template: `
    <div class="chart-container">
      <canvas baseChart
        [data]="chartData"
        [options]="chartOptions"
        type="line">
      </canvas>
    </div>
  `,
  styles: [`
    .chart-container {
      position: relative;
      width: 100%;
      height: 300px;

      @media (min-width: 768px) {
        height: 400px;
      }
    }

    canvas {
      width: 100% !important;
      height: 100% !important;
    }
  `]
})
export class GrowthChartComponent implements OnChanges {
  @Input() weightRecords: WeightRecord[] = [];
  @Input() birthWeight?: number;

  @ViewChild(BaseChartDirective) chart?: BaseChartDirective;

  chartData: ChartData<'line'> = {
    labels: [],
    datasets: []
  };

  chartOptions: ChartConfiguration<'line'>['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        title: {
          display: true,
          text: 'Age (days)'
        }
      },
      y: {
        title: {
          display: true,
          text: 'Weight (lbs)'
        },
        min: 0
      }
    },
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      tooltip: {
        mode: 'index',
        intersect: false
      }
    },
    interaction: {
      mode: 'nearest',
      axis: 'x',
      intersect: false
    }
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['weightRecords'] || changes['birthWeight']) {
      this.updateChartData();
    }
  }

  private updateChartData(): void {
    if (!this.weightRecords || this.weightRecords.length === 0) {
      this.chartData = { labels: [], datasets: [] };
      return;
    }

    // Sort records by age
    const sortedRecords = [...this.weightRecords].sort((a, b) => a.ageInDays - b.ageInDays);

    // Create labels (age in days)
    const labels = sortedRecords.map(r => r.ageInDays);

    // Actual weight data
    const actualWeights = sortedRecords.map(r => r.weight);

    // Calculate target line (3 lbs/day from birth weight)
    const startWeight = this.birthWeight || sortedRecords[0]?.weight || 75;
    const maxAge = Math.max(...labels, 200);
    const targetLabels = Array.from({ length: Math.ceil(maxAge / 10) + 1 }, (_, i) => i * 10);
    const targetWeights = targetLabels.map(age => startWeight + (age * GROWTH_CONSTANTS.TARGET_ADG));

    // Sale ready threshold line
    const saleReadyWeights = targetLabels.map(() => GROWTH_CONSTANTS.SALE_READY_WEIGHT);

    // Target sale weight line
    const targetSaleWeights = targetLabels.map(() => GROWTH_CONSTANTS.TARGET_SALE_WEIGHT);

    this.chartData = {
      labels: labels,
      datasets: [
        {
          label: 'Actual Weight',
          data: actualWeights,
          borderColor: '#198754',
          backgroundColor: 'rgba(25, 135, 84, 0.1)',
          fill: true,
          tension: 0.1,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: '#198754',
          borderWidth: 3
        },
        {
          label: `Target (${GROWTH_CONSTANTS.TARGET_ADG} lbs/day)`,
          data: targetLabels.map((age, i) => ({ x: age, y: targetWeights[i] })) as any,
          borderColor: '#6b7280',
          backgroundColor: 'transparent',
          borderDash: [5, 5],
          fill: false,
          tension: 0,
          pointRadius: 0,
          borderWidth: 2
        },
        {
          label: `Sale Ready (${GROWTH_CONSTANTS.SALE_READY_WEIGHT} lbs)`,
          data: targetLabels.map((age, i) => ({ x: age, y: saleReadyWeights[i] })) as any,
          borderColor: '#f59e0b',
          backgroundColor: 'transparent',
          borderDash: [2, 2],
          fill: false,
          tension: 0,
          pointRadius: 0,
          borderWidth: 1
        },
        {
          label: `Target Sale (${GROWTH_CONSTANTS.TARGET_SALE_WEIGHT} lbs)`,
          data: targetLabels.map((age, i) => ({ x: age, y: targetSaleWeights[i] })) as any,
          borderColor: '#dc3545',
          backgroundColor: 'transparent',
          borderDash: [10, 5],
          fill: false,
          tension: 0,
          pointRadius: 0,
          borderWidth: 1
        }
      ]
    };

    // Update chart if it exists
    if (this.chart) {
      this.chart.update();
    }
  }
}
