// src/app/features/breeding/components/add-breeding/add-breeding.component.ts
import { Component, OnInit } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BreedingEvent } from '../../../../shared/models/breeding.model';
import { BreedingService } from '../../../../core/services/breeding.service';

@Component({
  selector: 'app-add-breeding',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-breeding.component.html',
  styleUrl: './add-breeding.component.scss'
})
export class AddBreedingComponent implements OnInit {
  animalId!: string;

  constructor(
    private breedingService: BreedingService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.animalId = id;
    }
  }

  onSubmit(form: NgForm) {
    if (form.invalid) {
      return;
    }

    const newRecord: BreedingEvent = {
      ...form.value,
      //date: new Date(form.value.date)
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