import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { BirthingSchedule } from '../../../../shared/models/birthing-schedule.model';
import { BirthingService } from '../../../../core/services/birthing.service';
import { AnimalsService } from '../../../../core/services/animals.service';
import { Animal } from '../../../../shared/models/animal.model';

@Component({
  selector: 'app-birthing-schedule-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './birthing-schedule.component.html',
  styleUrl: './birthing-schedule.component.scss'
})
export class BirthingScheduleComponent implements OnInit {
  animalId!: string;
  animalName: string = '';
  birthingRecords$!: Observable<BirthingSchedule[]>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private birthingService: BirthingService,
    private animalsService: AnimalsService
  ) { }

  ngOnInit(): void {
    // Get the mother animal's ID from the route
    this.animalId = this.route.snapshot.paramMap.get('id')!;
    this.loadAnimalInfo();
    if (this.animalId) {
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
     // Fetch the records using the BirthingService
     this.birthingRecords$ = this.birthingService.getBirthingRecordsByAnimalId(this.animalId);
  }

  // TrackBy function for performance optimization
  trackByRecordId(index: number, record: BirthingSchedule): string {
    return record.id || index.toString();
  }

  onAddRecord() {
    // Navigate to the Add form: /animals/:id/birthing/add
    this.router.navigate(['/animals', this.animalId, 'birthing', 'add']);
  }

  onEdit(recordId: string) {
    // Navigate to the Edit form: /animals/:id/birthing/edit/:recordId
    this.router.navigate(['/animals', this.animalId, 'birthing', 'edit', recordId]);
  }
  
  onDelete(recordId: string) {
    if (confirm('Are you sure you want to permanently delete this birthing record?')) {
      this.birthingService.deleteBirthingRecord(this.animalId, recordId)
        .subscribe({
          next: () => {
            console.log('Birthing record deleted successfully!');
            this.loadRecords(); // Refresh the list after successful deletion
          },
          error: (error) => {
            console.error('Error deleting birthing record:', error);
          }
        });
    }
  }
}