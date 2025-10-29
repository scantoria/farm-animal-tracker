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
  visitData: Partial<BlacksmithVisit> = {}; 
  /*
  visitData: Partial<BlacksmithVisit> = {
    visitDate: '', 
    serviceProvided: '',
  };
  */
  blacksmiths$!: Observable<Blacksmith[]>;
  serviceOptions: string[] = ['Trim - All Four', 'Shoeing - Front', 'Shoeing - All Four', 'Corrective Trim'];


  constructor(
    private blacksmithService: BlacksmithService,
    private blacksmithDataService: BlacksmithDataService,
    private route: ActivatedRoute,
    private router: Router,
    private firestore: Firestore 
  ) { }

  ngOnInit(): void {
    this.animalId = this.route.snapshot.paramMap.get('id')!;
    //this.loadBlacksmiths();
  }

  loadBlacksmiths() {
    this.blacksmiths$ = this.blacksmithDataService.getAllBlacksmiths();
  }

  onFormInit(form: NgForm) {
      setTimeout(() => form.resetForm(), 0);
  }

  onSubmit(form: NgForm) {
    if (form.invalid) {
      console.log('Form is invalid. Errors:', form.controls);
      return;
    }

    // 1. Create DocumentReferences
    const animalRef: DocumentReference = doc(this.firestore, `animals/${this.animalId}`);
    //const blacksmithRef: DocumentReference = doc(this.firestore, `blacksmiths/${this.selectedBlacksmithId}`);

    // 2. Construct the MINIMAL record object
    const newVisit: any = {
      //visitDate: form.value.visitDate, 
      //serviceProvided: 'Test Entry',//form.value.serviceProvided,
      //nextAppointmentDate: form.value.nextAppointmentDate,
      //notes: form.value.notes,
      ...form.value,
      animalRef: animalRef,
      //blacksmithRef: blacksmithRef,
      //blacksmithRef: { id: 'TEST_ID', path: 'blacksmiths/TEST_ID' },
      //id: undefined 
    };// as BlacksmithVisit;


    // 3. Save the record
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