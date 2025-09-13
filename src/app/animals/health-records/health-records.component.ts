// src/app/animals/health-records/health-records.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Observable } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { HealthRecord } from '../health-record.model';
import { HealthRecordsService } from '../health-records.service';

@Component({
  selector: 'app-health-records',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <h2>Health Records</h2>
    <button [routerLink]="['/animals', animalId, 'add-health-record']">Add New Record</button>
    <div *ngIf="healthRecords$ | async as records">
      <div *ngFor="let record of records">
        <p><strong>Date:</strong> {{ record.date }}</p>
        <p><strong>Event:</strong> {{ record.eventType }}</p>
        <p><strong>Description:</strong> {{ record.description }}</p>
        <p><strong>Administered By:</strong> {{ record.administeredBy }}</p>
        <p *ngIf="record.dosage"><strong>Dosage:</strong> {{ record.dosage }}</p>
        <hr>
      </div>
    </div>
  `,
  styleUrl: './health-records.component.scss'
})
export class HealthRecordsComponent implements OnInit {
  healthRecords$!: Observable<HealthRecord[]>;
  animalId!: string;

  constructor(
    private route: ActivatedRoute,
    private healthRecordsService: HealthRecordsService
  ) { }

  ngOnInit(): void {
    this.healthRecords$ = this.route.paramMap.pipe(
      switchMap(params => {
        const animalId = params.get('id');
        if (animalId) {
          return this.healthRecordsService.getAllHealthRecords(animalId);
        } else {
          // Handle case where no animalId is present (e.g., return empty array)
          return new Observable<HealthRecord[]>();
        }
      })
    );
  }
}