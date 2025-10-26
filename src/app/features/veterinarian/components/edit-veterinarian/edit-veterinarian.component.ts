import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Firestore } from '@angular/fire/firestore';
import { Subscription } from 'rxjs';
import { Veterinarian } from '../../../../shared/models/veterinarian.model';
import { VeterinarianDataService } from '../../../../core/services/veterinarian-data.service';

@Component({
  selector: 'app-edit-veterinarian',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-veterinarian.component.html',
  styleUrl: './edit-veterinarian.component.scss'
})

export class EditVeterinarianComponent implements OnInit, OnDestroy {
  recordId!: string;
  vetData: Partial<Veterinarian> = {}; 
  private recordSubscription!: Subscription;

  specialtyOptions: string[] = [
    'General', 
    'Equine', 
    'Bovine', 
    'Caprine', 
    'Ovine',
    'Mixed Practice',
    'Other'
  ];

  constructor(
    private vetDataService: VeterinarianDataService,
    private route: ActivatedRoute,
    private router: Router,
    private firestore: Firestore 
  ) { }

  ngOnInit(): void {
    // 1. Get the record ID from the route
    this.recordId = this.route.snapshot.paramMap.get('recordId')!;
      
    // 2. Fetch the existing record and subscribe to its changes
    if(this.recordId){
      this.recordSubscription = this.vetDataService.getVeterinarian(this.recordId)
      .subscribe(record => {
        if (record) {
            this.vetData = record;
        } else {
            console.error('Veterinarian record not found.');
            this.router.navigate(['/admin/veterinarian']);
        }
      });
    }
  }

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    if (this.recordSubscription) {
      this.recordSubscription.unsubscribe();
    }
  }

  onSubmit(form: NgForm) {
    if (form.invalid || !this.recordId) {
      console.log('Form is invalid or Record ID is missing.');
      return;
    }
    
    const updatedVet: Partial<Veterinarian> = {
        ...form.value
    };

    this.vetDataService.updateVeterinarian(this.recordId, updatedVet)
      .subscribe({
        next: () => {
          console.log('Veterinarian updated successfully!');
          // Navigate back to the main list
          this.router.navigate(['/admin/veterinarian']); 
        },
        error: (error) => {
          console.error('Error updating veterinarian:', error);
        }
      });
  }

  onCancel() {
    this.router.navigate(['/admin/veterinarian']);
  }
}