import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Animal } from '../../../../shared/models/animal.model';
import { Farm } from '../../../../shared/models/farm.model';
import { MOVEMENT_REASONS, MovementReason } from '../../../../shared/models/farm-movement.model';
import { AnimalsService } from '../../../../core/services/animals.service';
import { FarmService } from '../../../../core/services/farm.service';

interface AnimalSelection {
  animal: Animal;
  selected: boolean;
}

@Component({
  selector: 'app-bulk-assign-animals',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './bulk-assign-animals.component.html',
  styleUrl: './bulk-assign-animals.component.scss'
})
export class BulkAssignAnimalsComponent implements OnInit {
  farmId: string = '';
  currentFarm: Farm | null = null;
  farms: Farm[] = [];
  animalSelections: AnimalSelection[] = [];
  filteredSelections: AnimalSelection[] = [];
  movementReasons = MOVEMENT_REASONS;

  // Form fields
  destinationFarmId: string = '';
  reason: MovementReason | '' = '';
  notes: string = '';

  // Filters
  filterSpecies: string = '';
  filterCurrentFarm: string = '';
  filterStatus: string = '';
  searchText: string = '';

  // State
  showConfirmation: boolean = false;
  isSubmitting: boolean = false;

  constructor(
    private animalsService: AnimalsService,
    private farmService: FarmService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.farmId = this.route.snapshot.paramMap.get('id') || '';
    this.loadData();
  }

  loadData(): void {
    // Load farms
    this.farmService.getAllFarms().subscribe({
      next: (farms) => {
        this.farms = farms;
      },
      error: (error) => {
        console.error('Error loading farms:', error);
      }
    });

    // Load current farm if farmId is provided
    if (this.farmId) {
      this.farmService.getFarmById(this.farmId).subscribe({
        next: (farm) => {
          this.currentFarm = farm;
        },
        error: (error) => {
          console.error('Error loading current farm:', error);
        }
      });
    }

    // Load all animals
    this.animalsService.getAll().subscribe({
      next: (animals) => {
        this.animalSelections = animals.map((animal: Animal) => ({
          animal,
          selected: false
        }));

        this.applyFilters();
      },
      error: (error) => {
        console.error('Error loading animals:', error);
      }
    });
  }

  applyFilters(): void {
    this.filteredSelections = this.animalSelections.filter(selection => {
      const animal = selection.animal;

      // Search filter
      if (this.searchText) {
        const searchLower = this.searchText.toLowerCase();
        const matchesSearch =
          animal.name.toLowerCase().includes(searchLower) ||
          (animal.identifier && animal.identifier.toLowerCase().includes(searchLower));
        if (!matchesSearch) return false;
      }

      // Species filter
      if (this.filterSpecies && animal.species !== this.filterSpecies) {
        return false;
      }

      // Current farm filter
      if (this.filterCurrentFarm) {
        if (this.filterCurrentFarm === 'none' && animal.currentFarmId) {
          return false;
        } else if (this.filterCurrentFarm !== 'none' && animal.currentFarmId !== this.filterCurrentFarm) {
          return false;
        }
      }

      // Status filter
      if (this.filterStatus && animal.status !== this.filterStatus) {
        return false;
      }

      return true;
    });
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  toggleSelection(selection: AnimalSelection): void {
    selection.selected = !selection.selected;
  }

  selectAll(): void {
    this.filteredSelections.forEach(selection => {
      selection.selected = true;
    });
  }

  clearAll(): void {
    this.animalSelections.forEach(selection => {
      selection.selected = false;
    });
  }

  get selectedCount(): number {
    return this.animalSelections.filter(s => s.selected).length;
  }

  get selectedAnimals(): Animal[] {
    return this.animalSelections
      .filter(s => s.selected)
      .map(s => s.animal);
  }

  get uniqueSpecies(): string[] {
    const species = new Set(this.animalSelections.map(s => s.animal.species));
    return Array.from(species).sort();
  }

  get uniqueStatuses(): string[] {
    const statuses = new Set(this.animalSelections.map(s => s.animal.status));
    return Array.from(statuses).sort();
  }

  showConfirmDialog(): void {
    if (this.selectedCount === 0 || !this.destinationFarmId) {
      return;
    }
    this.showConfirmation = true;
  }

  cancelConfirmation(): void {
    this.showConfirmation = false;
  }

  confirmTransfer(): void {
    if (this.selectedCount === 0 || !this.destinationFarmId || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    const animalIds = this.selectedAnimals.map(a => a.id!);
    const fromFarmId = this.farmId || null;

    this.farmService.bulkMoveAnimals(
      animalIds,
      fromFarmId,
      this.destinationFarmId,
      this.reason || undefined,
      this.notes || undefined
    ).subscribe({
      next: () => {
        const farmName = this.farms.find(f => f.id === this.destinationFarmId)?.name || 'selected farm';
        alert(`Successfully transferred ${this.selectedCount} animals to ${farmName}`);

        // Navigate back
        if (this.farmId) {
          this.router.navigate(['/farms', this.farmId]);
        } else {
          this.router.navigate(['/farms']);
        }
      },
      error: (error) => {
        console.error('Error transferring animals:', error);
        alert('Error transferring animals. Please try again.');
        this.isSubmitting = false;
        this.showConfirmation = false;
      }
    });
  }

  getFarmName(farmId: string | undefined): string {
    if (!farmId) return 'Not Assigned';
    const farm = this.farms.find(f => f.id === farmId);
    return farm?.name || 'Unknown Farm';
  }

  getDestinationFarmName(): string {
    return this.getFarmName(this.destinationFarmId);
  }

  cancel(): void {
    if (this.farmId) {
      this.router.navigate(['/farms', this.farmId]);
    } else {
      this.router.navigate(['/farms']);
    }
  }
}
