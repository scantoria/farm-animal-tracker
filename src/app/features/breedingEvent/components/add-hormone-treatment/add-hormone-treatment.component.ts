import { Component, OnInit } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HormoneTreatment } from '../../../../shared/models/hormone-treatment.model';
import { BreedingService } from '../../../../core/services/breeding.service';
import { Firestore, doc, DocumentReference } from '@angular/fire/firestore';
import { AnimalsService } from '../../../../core/services/animals.service';
import { Animal } from '../../../../shared/models/animal.model'; 

@Component({
  selector: 'app-add-hormone-treatment',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-hormone-treatment.component.html',
  styleUrl: './add-hormone-treatment.component.scss'
})
export class AddHormoneTreatmentComponent implements OnInit {
  animalId!: string;
  eventId!: string;
  animalName: string = '';

  hormoneTypes: string[] = ['GnRH', 'Prostaglandin (PGF2α)', 'CIDR', 'Oxytocin'];
  productSuggestions: string[] = ['Lutalyse', 'Estrumate', 'Factrel', 'Cystorelin', 'Eazi-Breed CIDR'];

  //treatmentData: Partial<HormoneTreatment> = {};

  constructor(
    private breedingService: BreedingService,
    private route: ActivatedRoute,
    private router: Router,
    private firestore: Firestore,
    private animalsService: AnimalsService
  ) { }

  ngOnInit(): void {
    this.animalId = this.route.snapshot.paramMap.get('id')!;
    this.eventId = this.route.snapshot.paramMap.get('eventId')!;
    this.loadAnimalInfo();
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

  onSubmit(form: NgForm) {
    if (form.invalid) {
      return;
    }

    const animalRef: DocumentReference = doc(
      this.firestore, 
      `animals/${this.animalId}`
    );

    const breedingEventRef: DocumentReference = doc(
      this.firestore, 
      `animals/${this.animalId}/breedingEvents/${this.eventId}`
    );

    const newTreatment: HormoneTreatment = {
      id: '', 
      treatmentDate: form.value.treatmentDate,
      animalRef: animalRef, 
      breedingEventRef: breedingEventRef, 
      hormoneType: form.value.hormoneType,
      productUsed: form.value.productUsed,
      dosage: form.value.dosage,
      administeredBy: form.value.administeredBy,
      notes: form.value.notes,
    };

    this.breedingService.addHormoneTreatment(this.animalId, this.eventId, newTreatment)
      .subscribe({
        next: () => {
          console.log('Hormone treatment added successfully!');
          this.router.navigate(['/animals', this.animalId, 'breeding', this.eventId, 'treatments']);
        },
        error: (error) => {
          console.error('Error adding hormone treatment:', error);
        }
      });
  }

  onCancel() {
    this.router.navigate(['/animals', this.animalId, 'breeding', this.eventId, 'treatments']);
  }
}