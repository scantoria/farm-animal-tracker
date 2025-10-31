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
  selector: 'app-add-veterinarian-visit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-veterinarian-visit.component.html',
  styleUrl: './add-veterinarian-visit.component.scss'
})
export class AddVeterinarianVisitComponent implements OnInit {
  animalId!: string;
  newRecord: Partial<VeterinarianVisit> = {};

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
    // Load the list of veterinarians for the dropdown
    this.veterinarians$ = this.veterinarianDataService.getAllVeterinarians();
  }

  onSubmit(form: NgForm) {
    if (form.invalid) {
      return;
    }

    // Create the animal reference
    const animalRef = doc(this.firestore, `animals/${this.animalId}`);

    // Create the visit record with the veterinarian reference if selected
    const visitRecord: VeterinarianVisit = {
      animalRef: animalRef,
      visitDate: this.newRecord.visitDate!,
      veterinarianName: this.newRecord.veterinarianName || '',
      visitType: this.newRecord.visitType!,
      diagnosis: this.newRecord.diagnosis,
      treatmentProvided: this.newRecord.treatmentProvided,
      medicationsAdministered: this.newRecord.medicationsAdministered,
      nextAppointmentDate: this.newRecord.nextAppointmentDate,
      notes: this.newRecord.notes
    };

    this.veterinarianVisitService.addVisitRecord(this.animalId, visitRecord)
      .subscribe({
        next: () => {
          console.log('Veterinarian visit record added successfully!');
          this.router.navigate(['/animals', this.animalId, 'veterinarian-visit']);
        },
        error: (error) => {
          console.error('Error adding visit record:', error);
        }
      });
  }

  onCancel() {
    this.router.navigate(['/animals', this.animalId, 'veterinarian-visit']);
  }
}
