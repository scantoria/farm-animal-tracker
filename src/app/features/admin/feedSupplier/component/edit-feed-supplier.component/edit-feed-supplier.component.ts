import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FeedSupplier, COMMON_FEED_PRODUCTS } from '../../../../../shared/models/feed-supplier.model';
import { FeedSupplierService } from '../../../../../core/services/feed-supplier.service';

@Component({
  selector: 'app-edit-feed-supplier',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './edit-feed-supplier.component.html',
  styleUrl: './edit-feed-supplier.component.scss'
})
export class EditFeedSupplierComponent implements OnInit {
  supplierId!: string;
  supplier: Partial<FeedSupplier> = {};
  isLoading = true;
  availableProducts = COMMON_FEED_PRODUCTS;
  selectedProducts: { [key: string]: boolean } = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private feedSupplierService: FeedSupplierService
  ) {}

  ngOnInit(): void {
    this.supplierId = this.route.snapshot.paramMap.get('id')!;

    // Initialize selectedProducts object
    this.availableProducts.forEach(product => {
      this.selectedProducts[product] = false;
    });

    this.loadSupplier();
  }

  loadSupplier() {
    this.feedSupplierService.getSupplierById(this.supplierId)
      .subscribe({
        next: (supplier) => {
          if (supplier) {
            this.supplier = supplier;

            // Set selected products from loaded data
            if (supplier.productsOffered) {
              supplier.productsOffered.forEach(product => {
                this.selectedProducts[product] = true;
              });
            }
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Error loading supplier:', error);
          this.isLoading = false;
        }
      });
  }

  onSubmit(form: NgForm) {
    if (form.invalid) {
      return;
    }

    // Build productsOffered array from selected checkboxes
    this.supplier.productsOffered = Object.keys(this.selectedProducts)
      .filter(product => this.selectedProducts[product]);

    this.feedSupplierService.updateSupplier(this.supplierId, this.supplier)
      .subscribe({
        next: () => {
          console.log('Feed supplier updated successfully!');
          this.router.navigate(['/admin/feed-suppliers']);
        },
        error: (error) => {
          console.error('Error updating feed supplier:', error);
        }
      });
  }

  onCancel() {
    this.router.navigate(['/admin/feed-suppliers']);
  }
}
