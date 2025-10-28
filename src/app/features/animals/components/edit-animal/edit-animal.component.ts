// src/app/edit-animal/edit-animal.component.ts

import { Component, OnInit } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { AnimalsService } from '../../../../core/services/animals.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Animal } from '../../../../shared/models/animal.model';
import { CommonModule } from '@angular/common';
//import { formatDateForInput } from '../../../../shared/utils/date.utils'; 

@Component({
  selector: 'app-edit-animal',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  providers: [AnimalsService],
  templateUrl: './edit-animal.component.html',
  styleUrl: './edit-animal.component.scss'
})
export class EditAnimalComponent implements OnInit {
  animal: Animal | undefined;

  constructor(
    private animalsService: AnimalsService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    const animalId = this.route.snapshot.paramMap.get('id');
    if (animalId) {
      this.animalsService.getAnimal(animalId)
        .subscribe(animal => {
          this.animal = animal;
        });
    }
  }

  onSubmit(form: NgForm): void {
    if (form.invalid || !this.animal?.id) {
      return;
    }

    const updatedAnimal: Animal = {
      ...this.animal, // Spread the existing properties
      name: form.value.name,
      species: form.value.species,
      breed: form.value.breed,
      dob: form.value.dob, // No more new Date() conversion
      sex: form.value.sex,
      status: form.value.status,
    };

    this.animalsService.updateAnimal(updatedAnimal)
      .subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
        error: (error) => {
          console.error('Error updating animal:', error);
        }
      });
  }
  //onBackToBreedingEvents() {
  //  this.router.navigate(['/animals', this.animal?.id, 'breeding']);
  //}
}