// src/app/features/hormone-treatment/components/hormone-treatment-list/hormone-treatment-list.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { take } from 'rxjs/operators';
import { HormoneTreatmentService, StandaloneHormoneTreatment, HORMONE_PROTOCOLS } from '../../../../core/services/hormone-treatment.service';
import { AnimalsService } from '../../../../core/services/animals.service';

@Component({
  selector: 'app-hormone-treatment-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './hormone-treatment-list.component.html',
  styleUrl: './hormone-treatment-list.component.scss'
})
export class StandaloneHormoneTreatmentListComponent implements OnInit {
  animalId!: string;
  animalName: string = '';
  treatments$!: Observable<StandaloneHormoneTreatment[]>;
  isLoading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private hormoneTreatmentService: HormoneTreatmentService,
    private animalsService: AnimalsService
  ) {}

  ngOnInit(): void {
    this.animalId = this.route.snapshot.paramMap.get('id')!;
    this.loadAnimalInfo();
    this.loadTreatments();
  }

  loadAnimalInfo(): void {
    this.animalsService.getAnimal(this.animalId).subscribe({
      next: (animal) => {
        if (animal) {
          this.animalName = animal.name;
        }
      },
      error: (error) => console.error('Error loading animal:', error)
    });
  }

  loadTreatments(): void {
    this.treatments$ = this.hormoneTreatmentService.getTreatmentsByAnimalId(this.animalId);
    this.treatments$.pipe(take(1)).subscribe(() => {
      this.isLoading = false;
    });
  }

  getProtocolLabel(protocolValue: string): string {
    const protocol = HORMONE_PROTOCOLS.find(p => p.value === protocolValue);
    return protocol ? protocol.label : protocolValue;
  }

  trackByTreatmentId(index: number, treatment: StandaloneHormoneTreatment): string {
    return treatment.id || index.toString();
  }

  onAddTreatment(): void {
    this.router.navigate(['/animals', this.animalId, 'hormone-treatments', 'add']);
  }

  onEdit(treatmentId: string): void {
    this.router.navigate(['/animals', this.animalId, 'hormone-treatments', 'edit', treatmentId]);
  }

  onDelete(treatment: StandaloneHormoneTreatment): void {
    if (!treatment.id) return;

    if (confirm('Are you sure you want to delete this hormone treatment record?')) {
      this.hormoneTreatmentService.deleteTreatment(this.animalId, treatment.id).subscribe({
        next: () => {
          this.loadTreatments();
        },
        error: (error) => {
          console.error('Error deleting treatment:', error);
          alert('Error deleting treatment. Please try again.');
        }
      });
    }
  }
}
