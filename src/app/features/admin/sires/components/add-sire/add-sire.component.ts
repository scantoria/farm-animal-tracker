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

  constructor(
    private sireService: SireService,
    private router: Router,
    private auth: Auth
  ) {}

  onSubmit(form: NgForm): void {
    if (form.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;
    const tenantId = this.auth.currentUser?.uid || 'default-tenant';

    const newSire: Sire = {
      tenantId: tenantId,
      name: form.value.name,
      registrationNumber: form.value.registrationNumber || undefined,
      species: form.value.species,
      breed: form.value.breed,
      sireName: form.value.sireName || undefined,
      damName: form.value.damName || undefined,
      bloodline: form.value.bloodline || undefined,
      source: form.value.source,
      provider: form.value.provider || undefined,
      status: form.value.status || 'active',
      notes: form.value.notes || undefined
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
