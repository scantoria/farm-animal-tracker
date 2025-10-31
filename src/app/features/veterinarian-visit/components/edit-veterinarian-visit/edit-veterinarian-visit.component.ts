import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Firestore, doc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { VeterinarianVisit } from '../../../../shared/models/veterinarian-visit.model';
import { Veterinarian } from '../../../../shared/models/veterinarian.model';
import { VeterinarianVisitService } from '../../../../core/services/veterinarian-visit.service';
import { VeterinarianDataService } from '../../../../core/services/veterinarian-data.service';

@Component({
  selector: 'app-edit-veterinarian-visit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-veterinarian-visit.component.html',
  styleUrl: './edit-veterinarian-visit.component.scss'
})
export class EditVeterinarianVisitComponent implements OnInit {
  animalId!: string;
  recordId!: string;
  visitRecord: Partial<VeterinarianVisit> = {};
  isLoading = true;

  veterinarians$!: Observable<Veterinarian[]>;

  visitTypeOptions: string[] = [
    'Routine Checkup',
    'Emergency',
    'Vaccination',
    'Surgery',
    'Medication Administration',
    'Other'
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private firestore: Firestore,
    private veterinarianVisitService: VeterinarianVisitService,
    private veterinarianDataService: VeterinarianDataService
  ) {}

  ngOnInit(): void {
    this.animalId = this.route.snapshot.paramMap.get('id')!;
    this.recordId = this.route.snapshot.paramMap.get('recordId')!;

    // Load the list of veterinarians for the dropdown
    this.veterinarians$ = this.veterinarianDataService.getAllVeterinarians();

    // Load the existing visit record
    this.loadVisitRecord();
  }

  loadVisitRecord() {
    this.veterinarianVisitService.getVisitRecord(this.animalId, this.recordId)
      .subscribe({
        next: (record) => {
          this.visitRecord = record;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading visit record:', error);
          this.isLoading = false;
        }
      });
  }

  onSubmit(form: NgForm) {
    if (form.invalid) {
      return;
    }

    // Create the animal reference
    const animalRef = doc(this.firestore, `animals/${this.animalId}`);

    // Create the updated visit record
    const updatedRecord: Partial<VeterinarianVisit> = {
      animalRef: animalRef,
      visitDate: this.visitRecord.visitDate!,
      veterinarianName: this.visitRecord.veterinarianName || '',
      visitType: this.visitRecord.visitType!,
      diagnosis: this.visitRecord.diagnosis,
      treatmentProvided: this.visitRecord.treatmentProvided,
      medicationsAdministered: this.visitRecord.medicationsAdministered,
      nextAppointmentDate: this.visitRecord.nextAppointmentDate,
      notes: this.visitRecord.notes
    };

    this.veterinarianVisitService.updateVisitRecord(this.animalId, this.recordId, updatedRecord)
      .subscribe({
        next: () => {
          console.log('Veterinarian visit record updated successfully!');
          this.router.navigate(['/animals', this.animalId, 'veterinarian-visit']);
        },
        error: (error) => {
          console.error('Error updating visit record:', error);
        }
      });
  }

  onCancel() {
    this.router.navigate(['/animals', this.animalId, 'veterinarian-visit']);
  }
}
