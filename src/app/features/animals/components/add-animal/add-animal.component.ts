// src/app/add-animal/add-animal.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgForm, FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { AnimalsService } from '../../../..//core/services/animals.service';
import { FarmService } from '../../../../core/services/farm.service';
import { Animal } from '../../../../shared/models/animal.model';
import { Farm } from '../../../../shared/models/farm.model';

@Component({
  selector: 'app-add-animal',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './add-animal.component.html',
  styleUrl: './add-animal.component.scss'
})
export class AddAnimalComponent implements OnInit {
  farms: Farm[] = [];

  constructor(
    private animalsService: AnimalsService,
    private farmService: FarmService,
    private router: Router,
    private auth: Auth
  ) { }

  ngOnInit(): void {
    this.farmService.getAllFarms().subscribe({
      next: (farms) => {
        this.farms = farms;
      },
      error: (error) => {
        console.error('Error loading farms:', error);
      }
    });
  }

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
      currentFarmId: form.value.currentFarmId || undefined,
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