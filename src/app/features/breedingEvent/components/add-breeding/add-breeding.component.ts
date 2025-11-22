// src/app/features/breeding/components/add-breeding/add-breeding.component.ts
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
  selector: 'app-add-breeding',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-breeding.component.html',
  styleUrl: './add-breeding.component.scss'
})
export class AddBreedingComponent implements OnInit {
  animalId!: string;
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
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.animalId = id;
      this.loadAnimalInfo();
      this.loadSires();
    }
  }

  loadSires(): void {
    this.sireService.getActiveSires().subscribe({
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
    if (form.invalid) {
      return;
    }

    const newRecord: BreedingEvent = {
      date: form.value.date,
      eventType: form.value.eventType,
      notes: form.value.notes,
      sireId: form.value.sireId || undefined,
    };

    this.breedingService.addBreedingEvent(this.animalId, newRecord)
      .subscribe({
        next: () => {
          console.log('Breeding event added successfully!');
          this.router.navigate(['/animals', this.animalId, 'breeding']);
        },
        error: (error) => {
          console.error('Error adding breeding event:', error);
        },
      });
  }

  onCancel() {
    this.router.navigate(['/animals', this.animalId, 'breeding']);
  }
}
