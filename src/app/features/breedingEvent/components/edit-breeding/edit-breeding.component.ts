// src/app/features/breeding/components/edit-breeding/edit-breeding.component.ts
import { Component, OnInit } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BreedingEvent } from '../../../../shared/models/breeding.model';
import { BreedingService } from '../../../../core/services/breeding.service';
import { AnimalsService } from '../../../../core/services/animals.service';
import { SireService } from '../../../../core/services/sire.service';
import { Animal } from '../../../../shared/models/animal.model';
import { Sire } from '../../../../shared/models/sire.model';

@Component({
  selector: 'app-edit-breeding',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-breeding.component.html',
  styleUrl: './edit-breeding.component.scss'
})
export class EditBreedingComponent implements OnInit {
  animalId!: string;
  eventId!: string;
  breedingEvent: BreedingEvent | undefined;
  animalName: string = '';
  sires: Sire[] = [];

  constructor(
    private breedingService: BreedingService,
    private route: ActivatedRoute,
    private router: Router,
    private animalsService: AnimalsService,
    private sireService: SireService
  ) { }

  ngOnInit(): void {
    this.animalId = this.route.snapshot.paramMap.get('id')!;
    this.eventId = this.route.snapshot.paramMap.get('eventId')!;

    if (this.animalId && this.eventId) {
      this.loadAnimalInfo();
      this.loadSires();
      this.breedingService.getBreedingEvent(this.animalId, this.eventId).subscribe(event => {
        this.breedingEvent = event;
      });
    }
  }

  loadSires(): void {
    this.sireService.getAll().subscribe({
      next: (sires) => {
        this.sires = sires;
      },
      error: (error) => console.error('Error loading sires:', error)
    });
  }

  getSireBloodline(sire: Sire): string {
    if (sire.sireName || sire.damName) {
      const parents = [];
      if (sire.sireName) parents.push(`Sire: ${sire.sireName}`);
      if (sire.damName) parents.push(`Dam: ${sire.damName}`);
      return ` — ${parents.join(', ')}`;
    } else if (sire.bloodline) {
      return ` — ${sire.bloodline}`;
    }
    return '';
  }

  getSourceLabel(source: string): string {
    switch (source) {
      case 'ai': return 'AI';
      case 'leased': return 'Leased';
      case 'owned': return 'Owned';
      default: return source;
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

  onSubmit(form: NgForm) {
    if (form.invalid || !this.breedingEvent) {
      return;
    }

    const updatedEvent: Partial<BreedingEvent> = {
      date: form.value.date,
      eventType: form.value.eventType,
      notes: form.value.notes,
      sireId: form.value.sireId || undefined,
    };

    this.breedingService.updateBreedingEvent(this.animalId, this.eventId, updatedEvent)
      .subscribe({
        next: () => {
          console.log('Breeding event updated successfully!');
          this.router.navigate(['/animals', this.animalId, 'breeding']);
        },
        error: (error) => {
          console.error('Error updating breeding event:', error);
        },
      });
  }

  onCancel() {
    this.router.navigate(['/animals', this.animalId, 'breeding']);
  }
}
