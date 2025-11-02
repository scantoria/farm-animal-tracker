import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { BlacksmithVisit } from '../../../../shared/models/blacksmith-visit.model';
import { BlacksmithService } from '../../../../core/services/blacksmith.service';
import { AnimalsService } from '../../../../core/services/animals.service';
import { Animal } from '../../../../shared/models/animal.model';

@Component({
  selector: 'app-blacksmith-visit-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './blacksmith-visit.component.html',
  styleUrl: './blacksmith-visit.component.scss'
})

export class BlacksmithVisitComponent implements OnInit {
  animalId!: string;
  visitRecords$!: Observable<BlacksmithVisit[]>;
  animalName: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private blacksmithService: BlacksmithService,
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
     this.visitRecords$ = this.blacksmithService.getVisitsByAnimalId(this.animalId);
  }

  // TrackBy function for performance optimization
  trackByRecordId(index: number, record: BlacksmithVisit): string {
    return record.id || index.toString();
  }

  onAddRecord() {
    this.router.navigate(['/animals', this.animalId, 'blacksmith', 'add']);
  }

  onEdit(recordId: string) {
    this.router.navigate(['/animals', this.animalId, 'blacksmith', 'edit', recordId]);
  }
  
  onDelete(recordId: string) {
    if (confirm('Are you sure you want to delete this blacksmith visit record?')) {
      this.blacksmithService.deleteVisitRecord(this.animalId, recordId)
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
}