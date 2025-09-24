import { Component, OnInit } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HealthModel } from '../../../../shared/models/health.model'; // Corrected path
import { HealthService } from '../../../../core/services/health.service'; // Corrected path

@Component({
  selector: 'app-add-health',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-health.component.html',
  styleUrl: './add-health.component.scss',
})
export class AddHealthComponent implements OnInit {
  animalId!: string;

  constructor(
    private healthService: HealthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

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

    const newRecord: HealthModel = {
      ...form.value,
    };

    this.healthService
      .addHealthRecord(this.animalId, newRecord)
      .subscribe({
        next: () => {
          console.log('Health record added successfully!');
          this.router.navigate(['/animals', this.animalId, 'health']);
        },
        error: (error) => {
          console.error('Error adding health record:', error);
        },
      });
  }

  onCancel() {
    this.router.navigate(['/animals', this.animalId, 'health']);
  }
}