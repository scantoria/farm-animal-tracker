// src/app/features/admin/sires/components/sires-management/sires-management.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { SireService } from '../../../../../core/services/sire.service';
import { BreedingService } from '../../../../../core/services/breeding.service';
import { Sire, SireWithStats } from '../../../../../shared/models/sire.model';
import { forkJoin, of } from 'rxjs';
import { map, switchMap, take } from 'rxjs/operators';

@Component({
  selector: 'app-sires-management',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './sires-management.component.html',
  styleUrl: './sires-management.component.scss'
})
export class SiresManagementComponent implements OnInit {
  sires: SireWithStats[] = [];
  filteredSires: SireWithStats[] = [];
  isLoading: boolean = true;

  // Filter properties
  speciesFilter: string = '';
  sourceFilter: string = '';
  searchTerm: string = '';
  availableSpecies: string[] = [];

  constructor(
    private sireService: SireService,
    private breedingService: BreedingService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadSires();
  }

  loadSires(): void {
    this.isLoading = true;

    this.sireService.getAll().pipe(
      take(1),
      switchMap(sires => {
        // Extract unique species
        this.availableSpecies = [...new Set(sires.map(s => s.species))].sort();

        if (sires.length === 0) {
          return of([]);
        }

        // For each sire, get breeding count (use take(1) since collectionData streams)
        const siresWithStats$ = sires.map(sire => {
          return this.breedingService.getBreedingEventsBySireId(sire.id!).pipe(
            take(1),
            map(events => ({
              ...sire,
              breedingCount: events.length
            } as SireWithStats))
          );
        });

        return forkJoin(siresWithStats$);
      })
    ).subscribe({
      next: (siresWithStats) => {
        this.sires = siresWithStats;
        this.applyFilters();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading sires:', error);
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.sires];

    // Apply species filter
    if (this.speciesFilter) {
      filtered = filtered.filter(s => s.species === this.speciesFilter);
    }

    // Apply source filter
    if (this.sourceFilter) {
      filtered = filtered.filter(s => s.source === this.sourceFilter);
    }

    // Apply search term
    if (this.searchTerm) {
      const term = this.searchTerm.toLowerCase();
      filtered = filtered.filter(s =>
        s.name.toLowerCase().includes(term) ||
        s.breed.toLowerCase().includes(term) ||
        (s.registrationNumber?.toLowerCase().includes(term)) ||
        (s.provider?.toLowerCase().includes(term))
      );
    }

    // Sort by name
    filtered.sort((a, b) => a.name.localeCompare(b.name));

    this.filteredSires = filtered;
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onSpeciesFilterChange(): void {
    this.applyFilters();
  }

  onSourceFilterChange(): void {
    this.applyFilters();
  }

  onAddSire(): void {
    this.router.navigate(['/admin/sires/add']);
  }

  onEditSire(sireId: string): void {
    this.router.navigate(['/admin/sires/edit', sireId]);
  }

  onDeleteSire(sire: SireWithStats): void {
    if (!confirm(`Are you sure you want to delete "${sire.name}"? This action cannot be undone.`)) {
      return;
    }

    this.sireService.deleteSire(sire.id!).subscribe({
      next: () => {
        this.sires = this.sires.filter(s => s.id !== sire.id);
        this.applyFilters();
      },
      error: (error) => {
        console.error('Error deleting sire:', error);
        alert('Error deleting sire. Please try again.');
      }
    });
  }

  getSourceLabel(source: string): string {
    switch (source) {
      case 'ai': return 'AI';
      case 'leased': return 'Leased';
      case 'owned': return 'Owned';
      default: return source;
    }
  }

  getBloodlineDisplay(sire: SireWithStats): string {
    if (sire.sireName && sire.damName) {
      return `${sire.sireName} x ${sire.damName}`;
    } else if (sire.sireName) {
      return `Sire: ${sire.sireName}`;
    } else if (sire.damName) {
      return `Dam: ${sire.damName}`;
    } else if (sire.bloodline) {
      return sire.bloodline;
    }
    return 'Unknown';
  }

  trackBySireId(index: number, sire: SireWithStats): string {
    return sire.id || index.toString();
  }
}
