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
import { getReproductiveStatusOptions } from '../../../../shared/utils/gestation-period.util';

@Component({
  selector: 'app-add-animal',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './add-animal.component.html',
  styleUrl: './add-animal.component.scss'
})
export class AddAnimalComponent implements OnInit {
  farms: Farm[] = [];
  selectedSex: 'male' | 'female' = 'female';
  reproductiveStatusOptions: Array<{value: string, label: string}> = [];

  // Bloodline/Parent selection
  potentialSires: Animal[] = [];
  potentialDams: Animal[] = [];

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

    // Load potential parents
    this.animalsService.getPotentialSires().subscribe({
      next: (sires) => this.potentialSires = sires,
      error: (error) => console.error('Error loading sires:', error)
    });

    this.animalsService.getPotentialDams().subscribe({
      next: (dams) => this.potentialDams = dams,
      error: (error) => console.error('Error loading dams:', error)
    });

    this.updateReproductiveStatusOptions();
  }

  onSexChange(event: any): void {
    this.selectedSex = event.target.value as 'male' | 'female';
    this.updateReproductiveStatusOptions();
  }

  updateReproductiveStatusOptions(): void {
    this.reproductiveStatusOptions = getReproductiveStatusOptions(this.selectedSex);
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
      reproductiveStatus: form.value.reproductiveStatus || 'unknown',
      currentFarmId: form.value.currentFarmId || undefined,
      sireId: form.value.sireId || undefined,
      damId: form.value.damId || undefined,
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