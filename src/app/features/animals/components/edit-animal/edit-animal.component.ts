// src/app/edit-animal/edit-animal.component.ts

import { Component, OnInit } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { AnimalsService } from '../../../../core/services/animals.service';
import { FarmService } from '../../../../core/services/farm.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Animal } from '../../../../shared/models/animal.model';
import { Farm } from '../../../../shared/models/farm.model';
import { FarmMovement } from '../../../../shared/models/farm-movement.model';
import { CommonModule } from '@angular/common';
import { Timestamp } from '@angular/fire/firestore';
import { getReproductiveStatusOptions } from '../../../../shared/utils/gestation-period.util';
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
  dobString: string = '';
  farms: Farm[] = [];
  previousFarmId: string | undefined;
  showSuccessMessage: boolean = false;
  successMessage: string = '';
  movementHistory: FarmMovement[] = [];
  currentFarm: Farm | null = null;
  showTransferDialog: boolean = false;
  transferDestinationFarmId: string = '';
  transferReason: string = '';
  transferNotes: string = '';
  reproductiveStatusOptions: Array<{value: string, label: string}> = [];

  constructor(
    private animalsService: AnimalsService,
    private farmService: FarmService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Load farms
    this.farmService.getAllFarms().subscribe({
      next: (farms) => {
        this.farms = farms;
      },
      error: (error) => {
        console.error('Error loading farms:', error);
      }
    });

    // Load animal
    const animalId = this.route.snapshot.paramMap.get('id');
    if (animalId) {
      this.animalsService.getAnimal(animalId)
        .subscribe(animal => {
          this.animal = animal;
          this.previousFarmId = animal?.currentFarmId;
          // Convert dob to string format for the date input
          if (animal?.dob) {
            this.dobString = this.convertToDateString(animal.dob);
          }

          // Update reproductive status options based on animal's sex
          if (animal?.sex) {
            this.reproductiveStatusOptions = getReproductiveStatusOptions(animal.sex);
          }

          // Load current farm details
          if (animal?.currentFarmId) {
            this.farmService.getFarmById(animal.currentFarmId).subscribe({
              next: (farm) => {
                this.currentFarm = farm;
              },
              error: (error) => {
                console.error('Error loading current farm:', error);
              }
            });
          }

          // Load movement history
          this.farmService.getAnimalMovementHistory(animalId).subscribe({
            next: (movements) => {
              this.movementHistory = movements;
            },
            error: (error) => {
              console.error('Error loading movement history:', error);
            }
          });
        });
    }
  }

  onSexChange(event: any): void {
    const sex = event.target.value as 'male' | 'female';
    this.reproductiveStatusOptions = getReproductiveStatusOptions(sex);
    // Reset reproductive status when sex changes
    if (this.animal) {
      this.animal.reproductiveStatus = 'unknown';
    }
  }

  // Helper method to convert Timestamp or string to yyyy-MM-dd format
  convertToDateString(dob: string | Timestamp): string {
    if (typeof dob === 'string') {
      return dob;
    } else if (dob instanceof Timestamp) {
      const date = dob.toDate();
      return date.toISOString().split('T')[0];
    }
    return '';
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
      dob: this.dobString, // Use the dobString which is in yyyy-MM-dd format
      sex: form.value.sex,
      status: form.value.status,
      reproductiveStatus: form.value.reproductiveStatus || 'unknown',
      currentFarmId: form.value.currentFarmId || undefined,
    };

    // Check if farm changed
    const farmChanged = this.previousFarmId !== form.value.currentFarmId;

    this.animalsService.updateAnimal(updatedAnimal)
      .subscribe({
        next: () => {
          // If farm changed, create movement record
          if (farmChanged && form.value.currentFarmId) {
            this.farmService.moveAnimalToFarm(
              this.animal!.id!,
              this.previousFarmId || null,
              form.value.currentFarmId,
              'Farm Assignment Change',
              'Updated via animal edit form'
            ).subscribe({
              next: () => {
                const farmName = this.farms.find(f => f.id === form.value.currentFarmId)?.name || 'selected farm';
                this.successMessage = `Animal moved to ${farmName}`;
                this.showSuccessMessage = true;
                setTimeout(() => {
                  this.showSuccessMessage = false;
                  this.router.navigate(['/']);
                }, 2000);
              },
              error: (error) => {
                console.error('Error creating movement record:', error);
                this.router.navigate(['/']);
              }
            });
          } else {
            this.router.navigate(['/']);
          }
        },
        error: (error) => {
          console.error('Error updating animal:', error);
        }
      });
  }
  openTransferDialog(): void {
    this.showTransferDialog = true;
    this.transferDestinationFarmId = '';
    this.transferReason = '';
    this.transferNotes = '';
  }

  closeTransferDialog(): void {
    this.showTransferDialog = false;
  }

  confirmTransfer(): void {
    if (!this.animal?.id || !this.transferDestinationFarmId) {
      return;
    }

    this.farmService.moveAnimalToFarm(
      this.animal.id,
      this.animal.currentFarmId || null,
      this.transferDestinationFarmId,
      this.transferReason || undefined,
      this.transferNotes || undefined
    ).subscribe({
      next: () => {
        const farmName = this.farms.find(f => f.id === this.transferDestinationFarmId)?.name || 'selected farm';
        this.successMessage = `Animal transferred to ${farmName}`;
        this.showSuccessMessage = true;
        this.showTransferDialog = false;

        // Reload data
        if (this.animal?.id) {
          this.animalsService.getAnimal(this.animal.id).subscribe(animal => {
            this.animal = animal;
            this.previousFarmId = animal?.currentFarmId;

            // Reload current farm
            if (animal?.currentFarmId) {
              this.farmService.getFarmById(animal.currentFarmId).subscribe(farm => {
                this.currentFarm = farm;
              });
            } else {
              this.currentFarm = null;
            }

            // Reload movement history
            this.farmService.getAnimalMovementHistory(this.animal!.id!).subscribe(movements => {
              this.movementHistory = movements;
            });
          });
        }

        setTimeout(() => {
          this.showSuccessMessage = false;
        }, 3000);
      },
      error: (error) => {
        console.error('Error transferring animal:', error);
        alert('Error transferring animal. Please try again.');
      }
    });
  }

  getMovementDateAssigned(): string {
    if (this.movementHistory.length > 0) {
      const latestMovement = this.movementHistory[0];
      return latestMovement.movementDate.toString();
    }
    return 'Unknown';
  }

  //onBackToBreedingEvents() {
  //  this.router.navigate(['/animals', this.animal?.id, 'breeding']);
  //}
}