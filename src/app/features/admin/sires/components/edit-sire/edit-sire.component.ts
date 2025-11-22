// src/app/features/admin/sires/components/edit-sire/edit-sire.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { SireService } from '../../../../../core/services/sire.service';
import { Sire } from '../../../../../shared/models/sire.model';

@Component({
  selector: 'app-edit-sire',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './edit-sire.component.html',
  styleUrl: './edit-sire.component.scss'
})
export class EditSireComponent implements OnInit {
  sire: Sire | undefined;
  isLoading: boolean = true;
  isSubmitting: boolean = false;

  constructor(
    private sireService: SireService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const sireId = this.route.snapshot.paramMap.get('sireId');
    if (sireId) {
      this.sireService.getSire(sireId).subscribe({
        next: (sire) => {
          if (sire) {
            this.sire = sire;
          } else {
            console.error('Sire not found');
            this.router.navigate(['/admin/sires']);
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading sire:', error);
          this.isLoading = false;
          this.router.navigate(['/admin/sires']);
        }
      });
    } else {
      this.router.navigate(['/admin/sires']);
    }
  }

  onSubmit(form: NgForm): void {
    if (form.invalid || this.isSubmitting || !this.sire) {
      return;
    }

    this.isSubmitting = true;

    const updatedSire: Sire = {
      ...this.sire,
      name: this.sire.name,
      registrationNumber: this.sire.registrationNumber || undefined,
      species: this.sire.species,
      breed: this.sire.breed,
      sireName: this.sire.sireName || undefined,
      damName: this.sire.damName || undefined,
      bloodline: this.sire.bloodline || undefined,
      source: this.sire.source,
      provider: this.sire.provider || undefined,
      status: this.sire.status,
      notes: this.sire.notes || undefined
    };

    this.sireService.updateSire(updatedSire).subscribe({
      next: () => {
        this.router.navigate(['/admin/sires']);
      },
      error: (error) => {
        console.error('Error updating sire:', error);
        this.isSubmitting = false;
        alert('Error updating sire. Please try again.');
      }
    });
  }
}
