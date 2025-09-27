// src/app/features/breeding/components/edit-breeding/edit-breeding.component.ts
import { Component, OnInit } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BreedingEvent } from '../../../../shared/models/breeding.model';
import { BreedingService } from '../../../../core/services/breeding.service';

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

  constructor(
    private breedingService: BreedingService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.animalId = this.route.snapshot.paramMap.get('id')!;
    this.eventId = this.route.snapshot.paramMap.get('eventId')!;

    if (this.animalId && this.eventId) {
      this.breedingService.getBreedingEvent(this.animalId, this.eventId).subscribe(event => {
        this.breedingEvent = event;
      });
    }
  }

  onSubmit(form: NgForm) {
    if (form.invalid || !this.breedingEvent) {
      return;
    }

    const updatedEvent: Partial<BreedingEvent> = {
      ...form.value,
      date: new Date(form.value.date)
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