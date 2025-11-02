// src/app/add-animal/add-animal.component.ts

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgForm, FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { AnimalsService } from '../../../..//core/services/animals.service';
import { Animal } from '../../../../shared/models/animal.model';

@Component({
  selector: 'app-add-animal',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './add-animal.component.html',
  styleUrl: './add-animal.component.scss'
})
export class AddAnimalComponent {

  constructor(
    private animalsService: AnimalsService,
    private router: Router,
    private auth: Auth
  ) { }

  onSubmit(form: NgForm) {
    if (form.invalid) {
      return;
    }

    const tenantId = this.auth.currentUser?.uid || 'default-tenant';

    const newAnimal: Animal = {
      tenantId: tenantId,
      name: form.value.name,
      species: form.value.species,
      breed: form.value.breed,
      identifier: form.value.identifier || '',  // Add identifier field
      dob: form.value.dob,
      sex: form.value.sex,
      status: form.value.status,
    };

    this.animalsService.addAnimal(newAnimal)
      .subscribe({
        next: () => {
          form.resetForm();
          this.router.navigate(['/']);
        },
        error: (error) => {
          console.error('Error adding animal:', error);
        }
      });
  }
}