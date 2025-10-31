import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { FeedSupplier } from '../../../../../shared/models/feed-supplier.model';
import { FeedSupplierService } from '../../../../../core/services/feed-supplier.service';

@Component({
  selector: 'app-feed-supplier-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './feed-supplier.component.html',
  styleUrl: './feed-supplier.component.scss'
})
export class FeedSupplierComponent implements OnInit {
  suppliers$!: Observable<FeedSupplier[]>;

  constructor(
    private feedSupplierService: FeedSupplierService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadSuppliers();
  }

  loadSuppliers() {
    this.suppliers$ = this.feedSupplierService.getAllSuppliers();
  }

  trackBySupplierId(index: number, supplier: FeedSupplier): string {
    return supplier.id!;
  }

  onDelete(supplierId: string) {
    if (confirm('Are you sure you want to delete this feed supplier? This action cannot be undone.')) {
      this.feedSupplierService.deleteSupplier(supplierId)
        .subscribe({
          next: () => {
            console.log('Feed supplier deleted successfully!');
            this.loadSuppliers(); // Refresh the list
          },
          error: (error) => {
            console.error('Error deleting feed supplier:', error);
          }
        });
    }
  }
}
