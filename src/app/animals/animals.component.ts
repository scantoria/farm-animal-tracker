import { Component, OnInit } from '@angular/core';
import { DataService } from '../data.service';
import { CommonModule } from '@angular/common';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-animals',
  standalone: true,
  imports: [CommonModule], // Add CommonModule here
  templateUrl: './animals.component.html',
  styleUrl: './animals.component.scss'
})
export class AnimalsComponent implements OnInit {
  animals$: Observable<any[]> | undefined;

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    this.animals$ = this.dataService.getAnimals();
  }

  deleteAnimal(animal: any) {
    this.dataService.deleteAnimal(animal)
      .then(() => {
        console.log('Animal deleted successfully!');
      })
      .catch(error => {
        console.error('Error deleting animal:', error);
      });
  }
}