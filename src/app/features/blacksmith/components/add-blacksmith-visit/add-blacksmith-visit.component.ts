import { Component, OnInit } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Firestore, doc, DocumentReference } from '@angular/fire/firestore';
import { BlacksmithVisit } from '../../../../shared/models/blacksmith-visit.model';
import { BlacksmithDataService } from '../../../../core/services/blacksmith-data.service';
import { Blacksmith } from '../../../../shared/models/blacksmith.model';
import { BlacksmithService } from '../../../../core/services/blacksmith.service';
import { Observable } from 'rxjs';
import { AnimalsService } from '../../../../core/services/animals.service';
import { Animal } from '../../../../shared/models/animal.model';

@Component({
  selector: 'app-add-blacksmith-visit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-blacksmith-visit.component.html',
  styleUrl: './add-blacksmith-visit.component.scss'
})
export class AddBlacksmithVisitComponent implements OnInit {
  animalId!: string;
  animalName: string = '';
  blacksmiths$!: Observable<Blacksmith[]>;
  visitData: Partial<BlacksmithVisit> = {}; 
  
  serviceOptions: string[] = [
    'Trim - All Four',
    'Shoeing - Front',
    'Shoeing - All Four',
    'Corrective Trim',
    'Therapeutic Shoeing',
    'Hoof Repair',
    'Custom Shoes'
  ];

  constructor(
    private blacksmithService: BlacksmithService,
    private blacksmithDataService: BlacksmithDataService,
    private route: ActivatedRoute,
    private router: Router,
    private firestore: Firestore,
    private animalsService: AnimalsService
  ) { }

  ngOnInit(): void {
    this.animalId = this.route.snapshot.paramMap.get('id')!;
    this.loadAnimalInfo();
    this.loadBlacksmiths();

    // Set default visit date to today for convenience
    this.visitData.visitDate = new Date().toISOString().substring(0, 10);
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

  loadBlacksmiths() {
    this.blacksmiths$ = this.blacksmithDataService.getAllBlacksmiths();
  }

  onSubmit(form: NgForm) {
    if (form.invalid) {
      console.log('Form is invalid. Errors:', form.controls);
      return;
    }
    
    const animalRef: DocumentReference = doc(this.firestore, `animals/${this.animalId}`);
    
    const newVisit: any = {
      ...form.value,
      animalRef: animalRef,
    };

    console.log('Submitting visit data:', form.value);

    this.blacksmithService.addVisitRecord(this.animalId, newVisit)
      .subscribe({
        next: () => {
          console.log('Blacksmith visit added successfully!');
          this.router.navigate(['/animals', this.animalId, 'blacksmith']);
        },
        error: (error) => {
          console.error('Error adding blacksmith visit:', error);
        }
      });
  }

  onCancel() {
    this.router.navigate(['/animals', this.animalId, 'blacksmith']);
  }
}