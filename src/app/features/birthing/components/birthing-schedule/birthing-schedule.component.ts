import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { BirthingSchedule } from '../../../../shared/models/birthing-schedule.model';
import { BirthingService } from '../../../../core/services/birthing.service';

@Component({
  selector: 'app-birthing-schedule-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './birthing-schedule.component.html',
  styleUrl: './birthing-schedule.component.scss'
})
export class BirthingScheduleComponent implements OnInit {
  animalId!: string;
  birthingRecords$!: Observable<BirthingSchedule[]>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private birthingService: BirthingService
  ) { }

  ngOnInit(): void {
    // Get the mother animal's ID from the route
    this.animalId = this.route.snapshot.paramMap.get('id')!;
    if (this.animalId) {
      this.loadRecords();
    }
  }

  loadRecords() {
     // Fetch the records using the BirthingService
     this.birthingRecords$ = this.birthingService.getBirthingRecordsByAnimalId(this.animalId);
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