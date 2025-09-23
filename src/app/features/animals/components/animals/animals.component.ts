// src/app/features/animals/animals.component.ts

import { Component, OnInit } from '@angular/core';
import { AnimalsService } from '../../../../core/services/animals.service';
import { Animal } from '../../../../shared/models/animal.model';
import { Observable } from 'rxjs';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-animals',
  standalone: true,
  imports: [CommonModule, RouterLink],
  providers: [AnimalsService],
  templateUrl: './animals.component.html',
  styleUrl: './animals.component.scss'
})
export class AnimalsComponent implements OnInit {

  animals$!: Observable<Animal[]>;

  constructor(private animalsService: AnimalsService) { }

  ngOnInit(): void {
    this.animals$ = this.animalsService.getAll();
  }

  deleteAnimal(animal: Animal): void {
    if (confirm('Are you sure you want to delete this animal?')) {
      this.animalsService.deleteAnimal(animal)
        .subscribe({
          next: () => {
            console.log('Animal deleted successfully.');
            // Re-fetch the list to update the view
            this.animals$ = this.animalsService.getAll();
          },
          error: (error) => {
            console.error('Error deleting animal:', error);
          }
        });
    }
  }
}