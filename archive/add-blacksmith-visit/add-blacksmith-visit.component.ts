// src/app/features/blacksmith/components/add-blacksmith-visit/add-blacksmith-visit.component.ts

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

@Component({
  selector: 'app-add-blacksmith-visit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-blacksmith-visit.component.html',
  styleUrl: './add-blacksmith-visit.component.scss'
})

export class AddBlacksmithVisitComponent implements OnInit {
  animalId!: string;
  selectedProviderName: string = ''; 
  blacksmiths$!: Observable<Blacksmith[]>;
  visitData: Partial<BlacksmithVisit> = {}; 
  serviceOptions: string[] = ['Select Service','Trim - All Four', 'Shoeing - Front', 'Shoeing - All Four', 'Corrective Trim'];


  constructor(
    private blacksmithService: BlacksmithService,
    private blacksmithDataService: BlacksmithDataService,
    private route: ActivatedRoute,
    private router: Router,
    private firestore: Firestore 
  ) { }

  ngOnInit(): void {
    this.animalId = this.route.snapshot.paramMap.get('id')!;
    this.loadBlacksmiths();
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
      
    };// as BlacksmithVisit;

    console.log(form.value);

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