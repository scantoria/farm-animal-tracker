import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { WeaningSchedule } from '../../../../shared/models/weaning-schedule.model';
import { WeaningService } from '../../../../core/services/weaning.service';
import { AnimalsService } from '../../../../core/services/animals.service';
import { Animal } from '../../../../shared/models/animal.model';

@Component({
  selector: 'app-weaning-schedule-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './weaning-schedule.component.html',
  styleUrl: './weaning-schedule.component.scss'
})
export class WeaningScheduleComponent implements OnInit {
  animalId!: string;
  animalName: string = '';
  weaningRecords$!: Observable<WeaningSchedule[]>;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private weaningService: WeaningService,
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
     this.weaningRecords$ = this.weaningService.getWeaningRecordsByAnimalId(this.animalId);
  }

  trackByRecordId(index: number, record: WeaningSchedule): string {
    return record.id || index.toString();
  }

  onBackToAnimal() {
    this.router.navigate(['/edit-animal', this.animalId]);
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