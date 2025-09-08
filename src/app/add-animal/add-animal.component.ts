import { Component } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { DataService } from '../data.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-animal',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './add-animal.component.html',
  styleUrl: './add-animal.component.scss'
})
export class AddAnimalComponent {

  constructor(private dataService: DataService, private router: Router) { }

  onSubmit(form: NgForm) {
    const { name, type } = form.value;

    this.dataService.addAnimal({ name, type })
      .then(() => {
        console.log('Animal added successfully!');
        form.resetForm();
        this.router.navigate(['/']); // Redirect to the home page
      })
      .catch((error) => {
        console.error('Error adding animal:', error);
      });
  }
}