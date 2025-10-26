import { Component, OnInit } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Firestore } from '@angular/fire/firestore';
import { Veterinarian } from '../../../../shared/models/veterinarian.model';
import { VeterinarianDataService } from '../../../../core/services/veterinarian-data.service';

@Component({
  selector: 'app-add-veterinarian',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-veterinarian.component.html',
  styleUrl: './add-veterinarian.component.scss'
})

export class AddVeterinarianComponent implements OnInit {
  vetData: Partial<Veterinarian> = {}; 

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
    private router: Router,
    private firestore: Firestore 
  ) { }

  ngOnInit(): void {
    // No specific initialization needed
  }

  onSubmit(form: NgForm) {
    if (form.invalid) {
      console.log('Form is invalid. Errors:', form.controls);
      return;
    }
    
    const newVet: Veterinarian = form.value as Veterinarian;
    
//console.log(newVet.specialty)
    // 3. Save the record
    this.vetDataService.addVeterinarian(newVet)
      .subscribe({
        next: () => {
          console.log('Veterinarian added successfully!');
          // Navigate back to the admin list view
          this.router.navigate(['/admin/veterinarian']); 
        },
        error: (error) => {
          console.error('Error adding veterinarian:', error);
        }
      });
  }

  onCancel() {
    this.router.navigate(['/admin/veterinarian']);
  }
}