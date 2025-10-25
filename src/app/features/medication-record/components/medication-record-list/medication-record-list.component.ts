import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';

// Update paths to your actual files
import { MedicationRecord } from '../../../../shared/models/medication-record.model';
import { MedicationService } from '../../../../core/services/medication.service'; 

@Component({
  selector: 'app-medication-record-list',
  standalone: true,
  // Add CommonModule and RouterModule for directives and routing links
  imports: [CommonModule, RouterModule], 
  templateUrl: './medication-record-list.component.html',
  styleUrl: './medication-record-list.component.scss'
})
export class MedicationRecordListComponent implements OnInit {
  animalId!: string;
  // Observable to hold the list of records
  medicationRecords$!: Observable<MedicationRecord[]>; 

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private medicationService: MedicationService // Inject the service
  ) { }

  ngOnInit(): void {
    // 1. Get the animal ID from the current route
    this.animalId = this.route.snapshot.paramMap.get('id')!;
    if (this.animalId) {
      this.loadRecords();
    }
  }

  loadRecords() {
    // 2. Call the service method to fetch records
    // NOTE: This method must be implemented in MedicationService (Step 3).
    this.medicationRecords$ = this.medicationService.getRecordsByAnimalId(this.animalId);
  }

  onAddRecord() {
    // Navigate to the "Add" route
    this.router.navigate(['/animals', this.animalId, 'medication-record', 'add']);
  }

  onEdit(recordId: string) {
    // Navigate to the "Edit" route (which you will build later)
    this.router.navigate(['/animals', this.animalId, 'medication-record', 'edit', recordId]);
    //this.router.navigate(['edit', recordId], { relativeTo: this.route })
  }
  
  onDelete(recordId: string) {
    if (confirm('Are you sure you want to delete this medication record?')) {
      // NOTE: This method must be implemented in MedicationService (Step 3).
      this.medicationService.deleteRecord(this.animalId, recordId)
        .subscribe({
          next: () => {
            console.log('Medication record deleted successfully!');
            // Reload the list after successful deletion
            this.loadRecords(); 
          },
          error: (error) => {
            console.error('Error deleting medication record:', error);
          }
        });
    }
  }
}