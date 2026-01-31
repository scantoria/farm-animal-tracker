// src/app/features/birth-event/components/record-birth/record-birth.component.ts
import { Component, OnInit } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import { BirthEventService, RecordBirthData } from '../../../../core/services/birth-event.service';
import { AnimalsService } from '../../../../core/services/animals.service';
import { SireService } from '../../../../core/services/sire.service';
import { AuthService } from '../../../../core/services/auth.service';
import { Animal } from '../../../../shared/models/animal.model';
import { Sire } from '../../../../shared/models/sire.model';
import { CALVING_EASE_OPTIONS, CalvingEase } from '../../../../shared/models/birth-event.model';

interface SireOption {
  id: string;
  name: string;
  breed: string;
  type: 'animal' | 'external';
  source?: string;
  bloodline?: string;
}

@Component({
  selector: 'app-record-birth',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './record-birth.component.html',
  styleUrl: './record-birth.component.scss'
})
export class RecordBirthComponent implements OnInit {
  animalId!: string;
  dam?: Animal;
  damName: string = '';

  // Form data
  birthDate: string = '';
  calfSex: 'Bull' | 'Heifer' = 'Bull';
  calfTag: string = '';
  calfName: string = '';
  birthWeight?: number;
  sireId: string = '';
  sireType: 'animal' | 'external' = 'external';
  calvingEase?: CalvingEase;
  enrollInGrowthTracking: boolean = true;
  notes: string = '';

  // Options
  calvingEaseOptions = CALVING_EASE_OPTIONS;
  sireOptions: SireOption[] = [];

  // State
  isSubmitting: boolean = false;
  currentUserId: string = '';
  tenantId: string = '';

  constructor(
    private birthEventService: BirthEventService,
    private animalsService: AnimalsService,
    private sireService: SireService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.animalId = id;
      this.birthDate = this.getTodayDate();
      this.loadDamInfo();
      this.loadSireOptions();
      this.loadCurrentUser();
    }
  }

  loadCurrentUser(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        this.currentUserId = user.uid;
        // In a real app, you'd get tenantId from user's profile/claims
        this.tenantId = user.uid; // Using uid as tenant for now
      }
    });
  }

  loadDamInfo(): void {
    this.animalsService.getAnimal(this.animalId).subscribe({
      next: (animal: Animal | undefined) => {
        if (animal) {
          this.dam = animal;
          this.damName = animal.name;
          this.tenantId = animal.tenantId;
        }
      },
      error: (error) => {
        console.error('Error loading dam info:', error);
      }
    });
  }

  loadSireOptions(): void {
    // Load both male animals and external sires
    forkJoin([
      this.animalsService.getPotentialSires(),
      this.sireService.getActiveSires()
    ]).subscribe({
      next: ([animals, sires]) => {
        // Add male animals as sire options
        const animalOptions: SireOption[] = animals
          .filter(a => a.id !== this.animalId) // Exclude the dam itself
          .map(a => ({
            id: a.id!,
            name: a.name,
            breed: a.breed,
            type: 'animal' as const,
            source: 'Herd Animal'
          }));

        // Add external sires
        const externalOptions: SireOption[] = sires.map(s => ({
          id: s.id!,
          name: s.name,
          breed: s.breed,
          type: 'external' as const,
          source: this.getSourceLabel(s.source),
          bloodline: this.getSireBloodline(s)
        }));

        this.sireOptions = [...externalOptions, ...animalOptions];
      },
      error: (error) => console.error('Error loading sire options:', error)
    });
  }

  getSourceLabel(source: string): string {
    switch (source) {
      case 'ai': return 'AI';
      case 'leased': return 'Leased';
      case 'owned': return 'Owned';
      default: return source;
    }
  }

  getSireBloodline(sire: Sire): string {
    const parts = [];
    if (sire.sireName) parts.push(`Sire: ${sire.sireName}`);
    if (sire.damName) parts.push(`Dam: ${sire.damName}`);
    if (parts.length === 0 && sire.bloodline) {
      return sire.bloodline;
    }
    return parts.join(', ');
  }

  onSireChange(sireId: string): void {
    this.sireId = sireId;
    const selectedSire = this.sireOptions.find(s => s.id === sireId);
    if (selectedSire) {
      this.sireType = selectedSire.type;
    }
  }

  onSexChange(): void {
    // Auto-enroll bulls in growth tracking by default
    this.enrollInGrowthTracking = this.calfSex === 'Bull';
  }

  onSubmit(form: NgForm): void {
    if (form.invalid || this.isSubmitting) {
      return;
    }

    this.isSubmitting = true;

    const birthData: RecordBirthData = {
      tenantId: this.tenantId,
      damId: this.animalId,
      birthDate: this.birthDate,
      sex: this.calfSex,
      calfTag: this.calfTag,
      calfName: this.calfName || this.calfTag,
      birthWeight: this.birthWeight,
      sireId: this.sireId || undefined,
      sireType: this.sireId ? this.sireType : undefined,
      calvingEase: this.calvingEase,
      enrollInGrowthTracking: this.enrollInGrowthTracking,
      notes: this.notes,
      createdBy: this.currentUserId,
      damBreed: this.dam?.breed,
      damSpecies: this.dam?.species,
      currentFarmId: this.dam?.currentFarmId,
      currentFarmName: this.dam?.currentFarmName
    };

    this.birthEventService.recordBirth(birthData).subscribe({
      next: (result) => {
        console.log('Birth recorded successfully!', result);
        this.isSubmitting = false;
        // Navigate to the new calf's profile
        this.router.navigate(['/edit-animal', result.calfId]);
      },
      error: (error) => {
        console.error('Error recording birth:', error);
        this.isSubmitting = false;
        alert('Error recording birth. Please try again.');
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/animals', this.animalId, 'birth-events']);
  }

  private getTodayDate(): string {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }
}
