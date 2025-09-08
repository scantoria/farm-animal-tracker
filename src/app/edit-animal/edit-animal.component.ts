import { Component, OnInit } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { DataService } from '../data.service';

@Component({
  selector: 'app-edit-animal',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './edit-animal.component.html',
  styleUrl: './edit-animal.component.scss'
})
export class EditAnimalComponent implements OnInit {
  animal: any;
  animalId: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.animalId = this.route.snapshot.paramMap.get('id');
    if (this.animalId) {
      this.dataService.getAnimalById(this.animalId).subscribe(animal => {
        this.animal = animal;
      });
    }
  }

  onSubmit(form: NgForm): void {
    const updatedAnimal = {
      id: this.animalId,
      ...form.value
    };

    this.dataService.updateAnimal(updatedAnimal)
      .then(() => {
        console.log('Animal updated successfully!');
        this.router.navigate(['/']);
      })
      .catch(error => {
        console.error('Error updating animal:', error);
      });
  }
}