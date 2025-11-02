import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { VeterinarianVisit } from '../../../../shared/models/veterinarian-visit.model';
import { VeterinarianVisitService } from '../../../../core/services/veterinarian-visit.service';
import { AnimalsService } from '../../../../core/services/animals.service';
import { Animal } from '../../../../shared/models/animal.model';

@Component({
  selector: 'app-veterinarian-visit-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './veterinarian-visit.component.html',
  styleUrl: './veterinarian-visit.component.scss'
})
export class VeterinarianVisitComponent implements OnInit {
  animalId!: string;
  animalName: string = '';
  visitRecords$!: Observable<VeterinarianVisit[]>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private veterinarianVisitService: VeterinarianVisitService,
    private animalsService: AnimalsService
  ) { }

  ngOnInit(): void {
    this.animalId = this.route.snapshot.paramMap.get('id')!;
    if (this.animalId) {
      this.loadAnimalInfo();
      this.loadRecords();
    }
  }

  loadAnimalInfo() {
    this.animalsService.getAnimal(this.animalId).subscribe({
      next: (animal: Animal | undefined) => {
        if (animal) {
          this.animalName = animal.name;
        }
      },
      error: (error) => {
        console.error('Error loading animal info:', error);
      }
    });
  }

  loadRecords() {
    this.visitRecords$ = this.veterinarianVisitService.getVisitsByAnimalId(this.animalId);
  }

  // TrackBy function for performance optimization
  trackByRecordId(index: number, record: VeterinarianVisit): string {
    return record.id || index.toString();
  }

  onAddRecord() {
    this.router.navigate(['/animals', this.animalId, 'veterinarian-visit', 'add']);
  }

  onEdit(recordId: string) {
    this.router.navigate(['/animals', this.animalId, 'veterinarian-visit', 'edit', recordId]);
  }

  onDelete(recordId: string) {
    if (confirm('Are you sure you want to delete this veterinarian visit record?')) {
      this.veterinarianVisitService.deleteVisitRecord(this.animalId, recordId)
        .subscribe({
          next: () => {
            console.log('Visit record deleted successfully!');
            this.loadRecords(); // Refresh the list
          },
          error: (error) => {
            console.error('Error deleting visit record:', error);
          }
        });
    }
  }

  onBackToAnimal() {
    this.router.navigate(['/edit-animal', this.animalId]);
  }
}
