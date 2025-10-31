import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Farm, createEmptyFarm } from '../../../../shared/models/farm.model';
import { FarmDataService } from '../../../../core/services/farm-data.service';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-farm-add',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './farm-add.component.html',
  styleUrl: './farm-add.component.scss'
})
export class FarmAddComponent implements OnInit {
  farm: Partial<Farm> = {};

  constructor(
    private farmDataService: FarmDataService,
    private router: Router,
    private auth: Auth
  ) {}

  ngOnInit(): void {
    const tenantId = this.auth.currentUser?.uid || 'default-tenant';
    this.farm = createEmptyFarm(tenantId);
  }

  onSubmit(form: NgForm) {
    if (form.invalid) {
      return;
    }

    this.farmDataService.createFarm(this.farm)
      .subscribe({
        next: (farmId) => {
          console.log('Farm created successfully!', farmId);
          this.router.navigate(['/farms']);
        },
        error: (error) => {
          console.error('Error creating farm:', error);
        }
      });
  }

  onCancel() {
    this.router.navigate(['/farms']);
  }
}
