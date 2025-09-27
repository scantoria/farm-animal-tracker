// src/app/features/breeding/components/pregnancy-check/pregnancy-check.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { PregnancyCheck } from '../../../../shared/models/pregnancy-check.model';
import { BreedingService } from '../../../../core/services/breeding.service';

@Component({
  selector: 'app-pregnancy-check',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './pregnancy-check.component.html',
  styleUrls: ['./pregnancy-check.component.scss'],
})
export class PregnancyCheckComponent implements OnInit {
  pregnancyChecks$!: Observable<PregnancyCheck[]>;
  animalId!: string;
  eventId!: string;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private breedingService: BreedingService
  ) {}

  ngOnInit(): void {
    this.animalId = this.route.snapshot.paramMap.get('id')!;
    this.eventId = this.route.snapshot.paramMap.get('eventId')!;
    
    if (this.animalId && this.eventId) {
      this.pregnancyChecks$ = this.breedingService.getPregnancyChecksByBreedingEventId(this.animalId, this.eventId);
    }
  }

  onAddCheck() {
    // We will define this route next
    this.router.navigate(['/animals', this.animalId, 'breeding', this.eventId, 'add-check']);
  }

  onBackToBreedingEvents() {
    this.router.navigate(['/animals', this.animalId, 'breeding']);
  }

  onEdit(checkId: string) {
    this.router.navigate(['/animals', this.animalId, 'breeding', this.eventId, 'checks', 'edit', checkId]);
  }

  onDelete(checkId: string) {
    if (confirm('Are you sure you want to delete this pregnancy check?')) {
      // NOTE: Ensure your BreedingService has this method implemented to delete
      this.breedingService.deletePregnancyCheck(this.animalId, this.eventId, checkId).subscribe(() => {
        console.log('Pregnancy check deleted successfully!');
      });
    }
  }

  // NOTE: We won't add edit/delete yet, as the service methods are not fully implemented.
}