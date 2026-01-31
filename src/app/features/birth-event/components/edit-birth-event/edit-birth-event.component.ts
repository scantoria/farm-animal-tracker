// src/app/features/birth-event/components/edit-birth-event/edit-birth-event.component.ts
import { Component, OnInit } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BirthEventService } from '../../../../core/services/birth-event.service';
import { AnimalsService } from '../../../../core/services/animals.service';
import { BirthEvent, CALVING_EASE_OPTIONS, CalvingEase } from '../../../../shared/models/birth-event.model';
import { Animal } from '../../../../shared/models/animal.model';

@Component({
  selector: 'app-edit-birth-event',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-birth-event.component.html',
  styleUrl: './edit-birth-event.component.scss'
})
export class EditBirthEventComponent implements OnInit {
  animalId!: string;
  eventId!: string;
  damName: string = '';
  calfName: string = '';

  // Form data (limited editing - can't change calf or dam)
  birthDate: string = '';
  birthWeight?: number;
  calvingEase?: CalvingEase;
  notes: string = '';

  // Original event data for display
  event?: BirthEvent;
  calf?: Animal;

  // Options
  calvingEaseOptions = CALVING_EASE_OPTIONS;

  // State
  isLoading: boolean = true;
  isSubmitting: boolean = false;

  constructor(
    private birthEventService: BirthEventService,
    private animalsService: AnimalsService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.animalId = this.route.snapshot.paramMap.get('id')!;
    this.eventId = this.route.snapshot.paramMap.get('eventId')!;

    if (this.animalId && this.eventId) {
      this.loadData();
    }
  }

  loadData(): void {
    // Load dam info
    this.animalsService.getAnimal(this.animalId).subscribe({
      next: (animal) => {
        if (animal) {
          this.damName = animal.name;
        }
      },
      error: (error) => console.error('Error loading dam:', error)
    });

    // Load birth event
    this.birthEventService.getBirthEvent(this.animalId, this.eventId).subscribe({
      next: (event) => {
        this.event = event;
        this.birthDate = this.toDateString(event.birthDate);
        this.birthWeight = event.birthWeight;
        this.calvingEase = event.calvingEase;
        this.notes = event.notes || '';

        // Load calf info
        this.animalsService.getAnimal(event.calfId).subscribe({
          next: (calf) => {
            this.calf = calf;
            this.calfName = calf?.name || 'Unknown';
            this.isLoading = false;
          },
          error: (error) => {
            console.error('Error loading calf:', error);
            this.isLoading = false;
          }
        });
      },
      error: (error) => {
        console.error('Error loading birth event:', error);
        this.isLoading = false;
      }
    });
  }

  onSubmit(form: NgForm): void {
    if (form.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    const updates: Partial<BirthEvent> = {
      birthDate: this.birthDate,
      birthWeight: this.birthWeight,
      calvingEase: this.calvingEase,
      notes: this.notes
    };

    this.birthEventService.updateBirthEvent(this.animalId, this.eventId, updates).subscribe({
      next: () => {
        console.log('Birth event updated successfully!');
        this.isSubmitting = false;
        this.router.navigate(['/animals', this.animalId, 'birth-events']);
      },
      error: (error) => {
        console.error('Error updating birth event:', error);
        this.isSubmitting = false;
        alert('Error updating birth event. Please try again.');
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/animals', this.animalId, 'birth-events']);
  }

  onViewCalf(): void {
    if (this.event?.calfId) {
      this.router.navigate(['/edit-animal', this.event.calfId]);
    }
  }

  private toDateString(value: any): string {
    if (!value) return '';
    if (value.toDate) {
      return value.toDate().toISOString().split('T')[0];
    }
    return new Date(value).toISOString().split('T')[0];
  }
}
