import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Farm } from '../../../../shared/models/farm.model';
import { FarmDataService } from '../../../../core/services/farm-data.service';

@Component({
  selector: 'app-farm-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './farm-edit.component.html',
  styleUrl: './farm-edit.component.scss'
})
export class FarmEditComponent implements OnInit {
  farmId!: string;
  farm: Partial<Farm> = {};
  isLoading = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private farmDataService: FarmDataService
  ) {}

  ngOnInit(): void {
    this.farmId = this.route.snapshot.paramMap.get('id')!;
    this.loadFarm();
  }

  loadFarm() {
    this.farmDataService.getFarmById(this.farmId)
      .subscribe({
        next: (farm) => {
          if (farm) {
            this.farm = farm;
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading farm:', error);
          this.isLoading = false;
        }
      });
  }

  onSubmit(form: NgForm) {
    if (form.invalid) {
      return;
    }

    this.farmDataService.updateFarm(this.farmId, this.farm)
      .subscribe({
        next: () => {
          console.log('Farm updated successfully!');
          this.router.navigate(['/farms']);
        },
        error: (error) => {
          console.error('Error updating farm:', error);
        }
      });
  }

  onCancel() {
    this.router.navigate(['/farms']);
  }
}
