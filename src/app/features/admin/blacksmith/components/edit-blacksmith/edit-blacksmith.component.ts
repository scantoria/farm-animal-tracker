import { Component, OnInit } from '@angular/core';
import { NgForm, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Blacksmith } from '../../../../../shared/models/blacksmith.model';
import { BlacksmithDataService } from '../../../../../core/services/blacksmith-data.service';
import { switchMap } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-edit-blacksmith',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './edit-blacksmith.component.html',
  styleUrl: './edit-blacksmith.component.scss'
})
export class EditBlacksmithComponent implements OnInit {
  blacksmith: Blacksmith | undefined;
  blacksmithId!: string;

  constructor(
    private blacksmithDataService: BlacksmithDataService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        this.blacksmithId = params.get('blacksmithId')!;
        if (this.blacksmithId) {
          return this.blacksmithDataService.getBlacksmith(this.blacksmithId);
        }
        return of(undefined);
      })
    ).subscribe(blacksmith => {
      this.blacksmith = blacksmith;
    });
  }

  onSubmit(form: NgForm) {
    if (form.invalid || !this.blacksmithId) {
      return;
    }

    const updatedData: Partial<Blacksmith> = {
      name: form.value.name,
      phone: form.value.phone,
      specialty: form.value.specialty,
    };

    this.blacksmithDataService.updateBlacksmith(this.blacksmithId, updatedData)
      .subscribe({
        next: () => {
          console.log('Blacksmith updated successfully!');
          // Navigate back to the admin list view
          this.router.navigate(['/admin/blacksmiths']);
        },
        error: (error) => {
          console.error('Error updating blacksmith:', error);
        }
      });
  }

  onCancel() {
    this.router.navigate(['/admin/blacksmiths']);
  }
}