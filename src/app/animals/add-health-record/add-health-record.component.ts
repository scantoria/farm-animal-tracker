// src/app/animals/add-health-record/add-health-record.component.ts

import { Component, OnInit } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HealthRecord } from '../health-record.model';
import { HealthRecordsService } from '../health-records.service';

@Component({
  selector: 'app-add-health-record',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-health-record.component.html',
  styleUrl: './add-health-record.component.scss'
})
export class AddHealthRecordComponent implements OnInit {
  animalId!: string;

  constructor(
    private healthRecordsService: HealthRecordsService,
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

    const newRecord: HealthRecord = {
      date: form.value.date,
      eventType: form.value.eventType,
      description: form.value.description,
      administeredBy: form.value.administeredBy,
      dosage: form.value.dosage
    };

    this.healthRecordsService.addHealthRecord(this.animalId, newRecord)
      .subscribe({
        next: () => {
          console.log('Health record added successfully!');
          this.router.navigate(['/animals', this.animalId, 'health-records']);
        },
        error: (err) => {
          console.error('Error adding health record:', err);
        }
      });
  }
}