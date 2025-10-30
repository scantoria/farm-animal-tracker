import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HealthService } from '../../../../core/services/health.service';
import { HealthModel } from '../../../../shared/models/health.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-health',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './health.component.html',
  styleUrls: ['./health.component.scss'],
})
export class HealthComponent implements OnInit {
  healthModel$!: Observable<HealthModel[]>;
  animalId!: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private healthService: HealthService
  ) {}

  ngOnInit(): void {
    this.animalId = this.route.snapshot.paramMap.get('id')!;
    if (this.animalId) {
      this.loadRecords();
    }
  }

  loadRecords() {
    this.healthModel$ = this.healthService.getHealthRecordsByAnimalId(
      this.animalId
    );
  }

  trackByRecordId(index: number, record: HealthModel): string {
    return record.id || index.toString();
  }

  onAddHealthRecord() {
    this.router.navigate(['/animals', this.animalId, 'add-health']);
  }

  onEdit(recordId: string) {
    this.router.navigate([
      '/animals',
      this.animalId,
      'health',
      'edit',
      recordId,
    ]);
  }

  onDelete(recordId: string) {
    if (confirm('Are you sure you want to delete this health record?')) {
      this.healthService.deleteHealthRecord(this.animalId, recordId).subscribe({
        next: () => {
          console.log('Record deleted successfully!');
          this.loadRecords();
        },
        error: (error) => {
          console.error('Error deleting health record:', error);
        }
      });
    }
  }

  // New method to navigate back to the animal record
  onBackToAnimal() {
    this.router.navigate(['/edit-animal', this.animalId]);
    //this.router.navigate(['/']);
  }
}