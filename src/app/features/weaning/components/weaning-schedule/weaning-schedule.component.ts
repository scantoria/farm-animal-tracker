import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { WeaningSchedule } from '../../../../shared/models/weaning-schedule.model';
import { WeaningService } from '../../../../core/services/weaning.service';

@Component({
  selector: 'app-weaning-schedule-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './weaning-schedule.component.html',
  styleUrl: './weaning-schedule.component.scss'
})
export class WeaningScheduleComponent implements OnInit {
  animalId!: string;
  weaningRecords$!: Observable<WeaningSchedule[]>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private weaningService: WeaningService
  ) { }

  ngOnInit(): void {
    this.animalId = this.route.snapshot.paramMap.get('id')!;
    if (this.animalId) {
      this.loadRecords();
    }
  }

  loadRecords() {
     this.weaningRecords$ = this.weaningService.getWeaningRecordsByAnimalId(this.animalId);
  }

  onAddRecord() {
    this.router.navigate(['/animals', this.animalId, 'weaning', 'add']);
  }

  onEdit(recordId: string) {
    this.router.navigate(['/animals', this.animalId, 'weaning', 'edit', recordId]);
  }
  
  onDelete(recordId: string) {
    if (confirm('Are you sure you want to delete this weaning record?')) {
      this.weaningService.deleteWeaningRecord(this.animalId, recordId)
        .subscribe({
          next: () => {
            console.log('Weaning record deleted successfully!');
            this.loadRecords(); // Refresh the list
          },
          error: (error) => {
            console.error('Error deleting weaning record:', error);
          }
        });
    }
  }
}