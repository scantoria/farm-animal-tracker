import { Component } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Blacksmith } from '../../../../../shared/models/blacksmith.model';
import { BlacksmithDataService } from '../../../../../core/services/blacksmith-data.service';

@Component({
  selector: 'app-add-blacksmith',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-blacksmith.component.html',
  styleUrl: './add-blacksmith.component.scss'
})
export class AddBlacksmithComponent {
  newBlacksmith: Partial<Blacksmith> = {};

  constructor(
    private blacksmithDataService: BlacksmithDataService,
    private router: Router
  ) { }

  onSubmit(form: NgForm) {
    if (form.invalid) {
      return;
    }

    const blacksmith: Blacksmith = form.value as Blacksmith;

    this.blacksmithDataService.addBlacksmith(blacksmith)
      .subscribe({
        next: () => {
          console.log('Blacksmith added successfully!');
          // Navigate back to the admin list view
          this.router.navigate(['/admin/blacksmiths']);
        },
        error: (error) => {
          console.error('Error adding blacksmith:', error);
        }
      });
  }

  onCancel() {
    this.router.navigate(['/admin/blacksmiths']);
  }
}