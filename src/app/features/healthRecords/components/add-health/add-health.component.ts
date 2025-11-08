import { Component, OnInit } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HealthModel, HEALTH_EVENT_TYPES } from '../../../../shared/models/health.model';
import { HealthService } from '../../../../core/services/health.service';
import { AnimalsService } from '../../../../core/services/animals.service';
import { Animal } from '../../../../shared/models/animal.model';
import { Castration, CASTRATION_METHODS } from '../../../../shared/models/castration.model';
import { Dehorning, DEHORNING_METHODS } from '../../../../shared/models/dehorning.model';

@Component({
  selector: 'app-add-health',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-health.component.html',
  styleUrl: './add-health.component.scss',
})
export class AddHealthComponent implements OnInit {
  animalId!: string;
  animalName: string = '';
  selectedEventType: string = '';

  // Constants for dropdowns
  healthEventTypes = HEALTH_EVENT_TYPES;
  castrationMethods = CASTRATION_METHODS;
  dehorningMethods = DEHORNING_METHODS;

  constructor(
    private healthService: HealthService,
    private route: ActivatedRoute,
    private router: Router,
    private animalsService: AnimalsService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.animalId = id;
      this.loadAnimalInfo();
    }
  }

  loadAnimalInfo() {
    this.animalsService.getAnimal(this.animalId).subscribe({
      next: (animal: Animal | undefined) => {
        if (animal) {
          this.animalName = animal.name;
        }
      },
      error: (error) => {
        console.error('Error loading animal info:', error);
      }
    });
  }

  onEventTypeChange(event: any) {
    this.selectedEventType = event.target.value;
  }

  isCastration(): boolean {
    return this.selectedEventType === 'castration';
  }

  isDehorning(): boolean {
    return this.selectedEventType === 'dehorning';
  }

  onSubmit(form: NgForm) {
    if (form.invalid) {
      return;
    }

    const newRecord: HealthModel = {
      ...form.value,
    };

    this.healthService
      .addHealthRecord(this.animalId, newRecord)
      .subscribe({
        next: () => {
          console.log('Health record added successfully!');
          this.router.navigate(['/animals', this.animalId, 'health']);
        },
        error: (error) => {
          console.error('Error adding health record:', error);
        },
      });
  }

  onCancel() {
    this.router.navigate(['/animals', this.animalId, 'health']);
  }
}