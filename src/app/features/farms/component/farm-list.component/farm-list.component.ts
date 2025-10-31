import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { Farm } from '../../../../shared/models/farm.model';
import { FarmDataService } from '../../../../core/services/farm-data.service';

@Component({
  selector: 'app-farm-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './farm-list.component.html',
  styleUrl: './farm-list.component.scss' 
})

export class FarmListComponent implements OnInit {
  farms$!: Observable<Farm[]>;

  constructor(
    private farmDataService: FarmDataService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadFarms();
  }

  loadFarms() {
    this.farms$ = this.farmDataService.getAllFarms();
  }

  trackByFarmId(index: number, farm: Farm): string {
    return farm.id!;
  }

  hasFacilities(farm: Farm): boolean {
    return farm.facilities.hasBarn ||
           (farm.facilities.hayStorageCapacity !== undefined && farm.facilities.hayStorageCapacity > 0) ||
           farm.facilities.hasCattleChute ||
           farm.facilities.hasLoadingRamp ||
           farm.facilities.hasWaterSource ||
           farm.facilities.hasShelter;
  }

  onDelete(farmId: string) {
    if (confirm('Are you sure you want to delete this farm? This action cannot be undone.')) {
      this.farmDataService.deleteFarm(farmId)
        .subscribe({
          next: () => {
            console.log('Farm deleted successfully!');
            this.loadFarms(); // Refresh the list
          },
          error: (error) => {
            console.error('Error deleting farm:', error);
          }
        });
    }
  }
}