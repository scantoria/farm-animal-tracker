// src/app/features/admin/sires/components/add-sire/add-sire.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Auth } from '@angular/fire/auth';
import { SireService } from '../../../../../core/services/sire.service';
import { Sire } from '../../../../../shared/models/sire.model';

@Component({
  selector: 'app-add-sire',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './add-sire.component.html',
  styleUrl: './add-sire.component.scss'
})
export class AddSireComponent {
  isSubmitting: boolean = false;

  // Form model with default values
  sire: Partial<Sire> = {
    name: '',
    registrationNumber: '',
    species: '',
    breed: '',
    source: undefined,  // Will be selected from dropdown
    provider: '',
    status: 'active',
    sireName: '',
    damName: '',
    bloodline: '',
    notes: ''
  };

  constructor(
    private sireService: SireService,
    private router: Router,
    private auth: Auth
  ) {}

  onSubmit(form: NgForm): void {
    if (form.invalid || this.isSubmitting) {
      // Mark all fields as touched to show validation errors
      Object.keys(form.controls).forEach(key => {
        form.controls[key].markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    const tenantId = this.auth.currentUser?.uid || 'default-tenant';

    const newSire: Sire = {
      tenantId: tenantId,
      name: this.sire.name!,
      registrationNumber: this.sire.registrationNumber || undefined,
      species: this.sire.species!,
      breed: this.sire.breed!,
      sireName: this.sire.sireName || undefined,
      damName: this.sire.damName || undefined,
      bloodline: this.sire.bloodline || undefined,
      source: this.sire.source!,
      provider: this.sire.provider || undefined,
      status: this.sire.status || 'active',
      notes: this.sire.notes || undefined
    };

    this.sireService.addSire(newSire).subscribe({
      next: () => {
        this.router.navigate(['/admin/sires']);
      },
      error: (error) => {
        console.error('Error adding sire:', error);
        this.isSubmitting = false;
        alert('Error adding sire. Please try again.');
      }
    });
  }
}
