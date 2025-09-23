// src/app/add-animal/add-animal.component.ts

import { Component } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { AnimalsService } from '../../../..//core/services/animals.service';
import { Router } from '@angular/router';
import { Animal } from '../../../../shared/models/animal.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-add-animal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-animal.component.html',
  styleUrl: './add-animal.component.scss'
})
export class AddAnimalComponent {

  constructor(private animalsService: AnimalsService, private router: Router) { }

  onSubmit(form: NgForm) {
    if (form.invalid) {
      return;
    }

    const newAnimal: Animal = {
      name: form.value.name,
      species: form.value.species,
      breed: form.value.breed,
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