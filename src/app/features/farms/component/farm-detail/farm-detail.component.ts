import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable, combineLatest, map } from 'rxjs';
import { Farm } from '../../../../shared/models/farm.model';
import { Animal } from '../../../../shared/models/animal.model';
import { FarmMovement } from '../../../../shared/models/farm-movement.model';
import { FarmService } from '../../../../core/services/farm.service';

@Component({
  selector: 'app-farm-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './farm-detail.component.html',
  styleUrl: './farm-detail.component.scss'
})
export class FarmDetailComponent implements OnInit {
  farm$!: Observable<Farm | null>;
  animals$!: Observable<Animal[]>;
  movements$!: Observable<FarmMovement[]>;
  farmId: string = '';

  constructor(
    private farmService: FarmService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.farmId = this.route.snapshot.paramMap.get('id') || '';

    if (this.farmId) {
      this.loadFarmDetails();
    }
  }

  loadFarmDetails(): void {
    // Load farm information
    this.farm$ = this.farmService.getFarmById(this.farmId);

    // Load animals on this farm
    this.animals$ = this.farmService.getAnimalsOnFarm(this.farmId);

    // Load recent movements for this farm (last 10)
    this.movements$ = this.farmService.getFarmMovementHistory(this.farmId, 10);
  }

  hasFacilities(farm: Farm): boolean {
    return farm.facilities.hasBarn ||
           (farm.facilities.hayStorageCapacity !== undefined && farm.facilities.hayStorageCapacity > 0) ||
           farm.facilities.hasCattleChute ||
           farm.facilities.hasLoadingRamp ||
           farm.facilities.hasWaterSource ||
           farm.facilities.hasShelter;
  }

  trackByAnimalId(index: number, animal: Animal): string {
    return animal.id!;
  }

  trackByMovementId(index: number, movement: FarmMovement): string {
    return movement.id!;
  }

  navigateToAnimal(animalId: string): void {
    this.router.navigate(['/animals', animalId, 'edit']);
  }

  navigateToAssignAnimals(): void {
    this.router.navigate(['/farms', this.farmId, 'assign-animals']);
  }

  navigateToBulkTransfer(): void {
    this.router.navigate(['/farms', this.farmId, 'bulk-transfer']);
  }
}
