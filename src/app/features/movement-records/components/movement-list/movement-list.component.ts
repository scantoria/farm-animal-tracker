// src/app/features/movement-records/components/movement-list/movement-list.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MovementRecordsService, MovementFilters, FarmInventorySummary } from '../../../../core/services/movement-records.service';
import { FarmService } from '../../../../core/services/farm.service';
import { FarmMovement, MOVEMENT_REASONS, MovementReason } from '../../../../shared/models/farm-movement.model';
import { Farm } from '../../../../shared/models/farm.model';
import { Timestamp } from '@angular/fire/firestore';

@Component({
  selector: 'app-movement-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './movement-list.component.html',
  styleUrl: './movement-list.component.scss'
})
export class MovementListComponent implements OnInit {
  // Data
  movements: FarmMovement[] = [];
  farms: Farm[] = [];
  inventorySummary: FarmInventorySummary[] = [];

  // Loading states
  isLoading = true;
  isLoadingInventory = true;

  // Filters
  filters: MovementFilters = {};
  reasonOptions = MOVEMENT_REASONS;

  // View mode
  viewMode: 'movements' | 'inventory' = 'movements';

  constructor(
    private movementService: MovementRecordsService,
    private farmService: FarmService
  ) {}

  ngOnInit(): void {
    this.loadFarms();
    this.loadMovements();
    this.loadInventorySummary();
  }

  loadFarms(): void {
    this.farmService.getAllFarms().subscribe({
      next: (farms) => {
        this.farms = farms;
      },
      error: (err) => console.error('Error loading farms:', err)
    });
  }

  loadMovements(): void {
    this.isLoading = true;
    this.movementService.getAllMovements(this.filters).subscribe({
      next: (movements) => {
        this.movements = movements;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error loading movements:', err);
        this.isLoading = false;
      }
    });
  }

  loadInventorySummary(): void {
    this.isLoadingInventory = true;
    this.movementService.getFarmInventorySummary().subscribe({
      next: (summary) => {
        this.inventorySummary = summary;
        this.isLoadingInventory = false;
      },
      error: (err) => {
        console.error('Error loading inventory:', err);
        this.isLoadingInventory = false;
      }
    });
  }

  applyFilters(): void {
    this.loadMovements();
  }

  clearFilters(): void {
    this.filters = {};
    this.loadMovements();
  }

  setViewMode(mode: 'movements' | 'inventory'): void {
    this.viewMode = mode;
  }

  formatDate(value: string | Timestamp): string {
    if (!value) return 'N/A';
    if (typeof value === 'string') {
      return new Date(value).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    }
    return value.toDate().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getFarmName(farmId: string | null): string {
    if (!farmId) return 'Not Assigned';
    const farm = this.farms.find(f => f.id === farmId);
    return farm?.name || 'Unknown Farm';
  }

  getSpeciesKeys(summary: FarmInventorySummary): string[] {
    return Object.keys(summary.animalsBySpecies);
  }

  getTotalInventory(): number {
    return this.inventorySummary.reduce((sum, s) => sum + s.totalAnimals, 0);
  }

  trackByMovementId(index: number, movement: FarmMovement): string {
    return movement.id || index.toString();
  }

  trackByFarmId(index: number, summary: FarmInventorySummary): string {
    return summary.farmId;
  }
}
