import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { Blacksmith } from '../../../../../shared/models/blacksmith.model';
import { BlacksmithDataService } from '../../../../../core/services/blacksmith-data.service';
import { FormsModule } from '@angular/forms'; // Needed for any potential inline forms later

@Component({
  selector: 'app-blacksmith-admin',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './blacksmith-admin.component.html',
  styleUrl: './blacksmith-admin.component.scss'
})
export class BlacksmithAdminComponent implements OnInit {
  blacksmiths$!: Observable<Blacksmith[]>;
  
  // State variables for the Add/Edit form overlay or inline form (optional for this initial step)
  isAdding: boolean = false;
  newBlacksmith: Partial<Blacksmith> = {};

  constructor(
    private blacksmithDataService: BlacksmithDataService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadBlacksmiths();
  }

  loadBlacksmiths() {
    // Uses the dedicated service to fetch all top-level blacksmith records
    this.blacksmiths$ = this.blacksmithDataService.getAllBlacksmiths();
  }

  onAddBlacksmith() {
    // For now, let's navigate to a dedicated Add Blacksmith route.
    // If you prefer an inline form, we would set isAdding = true;
    this.router.navigate(['/admin/blacksmiths/add']);
  }

  onEdit(blacksmithId: string) {
    this.router.navigate(['/admin/blacksmiths/edit', blacksmithId]);
  }

  onDelete(blacksmithId: string) {
    if (confirm('Are you sure you want to permanently delete this blacksmith record?')) {
      this.blacksmithDataService.deleteBlacksmith(blacksmithId)
        .subscribe({
          next: () => {
            console.log('Blacksmith deleted successfully!');
            this.loadBlacksmiths(); // Refresh the list
          },
          error: (error) => {
            console.error('Error deleting blacksmith:', error);
          }
        });
    }
  }

  trackByBlacksmithId(index: number, blacksmith: Blacksmith): string {
    return blacksmith.id || index.toString();
  }
}