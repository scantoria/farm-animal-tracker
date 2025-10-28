// src/app/features/blacksmith/components/edit-blacksmith-visit/edit-blacksmith-visit.component.ts

import { Component, OnInit } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Firestore, doc, DocumentReference } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { BlacksmithVisit } from '../../../../shared/models/blacksmith-visit.model';
import { BlacksmithDataService } from '../../../../core/services/blacksmith-data.service';
import { Blacksmith } from '../../../../shared/models/blacksmith.model';
import { BlacksmithService } from '../../../../core/services/blacksmith.service';
import { formatDateForInput } from '../../../../shared/utils/date.utils'; 


@Component({
  selector: 'app-edit-blacksmith-visit',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-blacksmith-visit.component.html',
  styleUrl: './edit-blacksmith-visit.component.scss'
})
export class EditBlacksmithVisitComponent implements OnInit {
  animalId!: string;
  recordId!: string;
  visitData: Partial<BlacksmithVisit> = {}; 
  blacksmiths$!: Observable<Blacksmith[]>;
  serviceOptions: string[] = ['Select Service', 'Trim - All Four', 'Shoeing - Front', 'Shoeing - All Four', 'Corrective Trim'];

  constructor(
    private blacksmithService: BlacksmithService,
    private blacksmithDataService: BlacksmithDataService,
    private route: ActivatedRoute,
    private router: Router,
    private firestore: Firestore 
  ) { }

  ngOnInit(): void {
    this.animalId = this.route.snapshot.paramMap.get('id')!;
    this.recordId = this.route.snapshot.paramMap.get('recordId')!;
    this.loadBlacksmiths();
      
    if(this.animalId && this.recordId){
      this.blacksmithService.getVisitRecord(this.animalId, this.recordId)
      .subscribe(record => {
        this.visitData = {
          ...record,
          visitDate: formatDateForInput(record.visitDate),
          nextAppointmentDate: formatDateForInput(record.nextAppointmentDate)
        };
      });
    }
  }

  loadBlacksmiths(){
    this.blacksmiths$ = this.blacksmithDataService.getAllBlacksmiths();
  }

  onSubmit(form: NgForm) {
    if (form.invalid || !this.recordId) {
      console.log('Form is invalid or Record ID is missing.');
      return;
    }
    
    const animalRef: DocumentReference = doc(this.firestore, `animals/${this.animalId}`);
    const updatedVisit: BlacksmithVisit = {
      ...form.value,
      animalRef: animalRef,
    } as BlacksmithVisit;

    this.blacksmithService.updateVisitRecord(this.animalId, this.recordId, updatedVisit)
      .subscribe({
        next: () => {
          console.log('Blacksmith visit updated successfully!');
          this.router.navigate(['/animals', this.animalId, 'blacksmith']);
        },
        error: (error) => {
          console.error('Error updating blacksmith visit:', error);
        }
      });
  }

  onCancel() {
    this.router.navigate(['/animals', this.animalId, 'blacksmith']);
  }
}