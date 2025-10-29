// src/app/features/veterinarian/components/veterinarian-admin/veterinarian-admin.component.ts

import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { Veterinarian } from '../../../../../shared/models/veterinarian.model';
import { VeterinarianDataService } from '../../../../../core/services/veterinarian-data.service';

@Component({
  selector: 'app-veterinarian-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './veterinarian-admin.component.html',
  styleUrl: './veterinarian-admin.component.scss'
})

export class VeterinarianAdminComponent implements OnInit {
  veterinarians$!: Observable<Veterinarian[]>;

  constructor(
    private router: Router,
    private vetDataService: VeterinarianDataService
  ) { }

  ngOnInit(): void {
    this.loadVeterinarians();
  }

  loadVeterinarians() {
    this.veterinarians$ = this.vetDataService.getAllVeterinarians();
  }

  onAddVeterinarian() {
    this.router.navigate(['/admin/veterinarian/add']);
  }

  onEdit(vetId: string) {
    //this.router.navigate(['/veterinarian-admin/edit', vetId]);
    this.router.navigate(['/admin/veterinarian/edit', vetId]);
  }

  onDelete(vetId: string) {
    if (confirm('Are you sure you want to delete this veterinarian? This action cannot be undone.')) {
      this.vetDataService.deleteVeterinarian(vetId)
        .subscribe({
          next: () => {
            console.log('Veterinarian deleted successfully!');
            // The Observable will automatically refresh the list
          },
          error: (error) => {
            console.error('Error deleting veterinarian:', error);
          }
        });
    }
  }
}