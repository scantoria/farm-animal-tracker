import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { FeedSupplier, createEmptySupplier, COMMON_FEED_PRODUCTS } from '../../../../../shared/models/feed-supplier.model';
import { FeedSupplierService } from '../../../../../core/services/feed-supplier.service';
import { Auth } from '@angular/fire/auth';

@Component({
  selector: 'app-add-feed-supplier',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './add-feed-supplier.component.html',
  styleUrl: './add-feed-supplier.component.scss'
})
export class AddFeedSupplierComponent implements OnInit {
  supplier: Partial<FeedSupplier> = {};
  availableProducts = COMMON_FEED_PRODUCTS;
  selectedProducts: { [key: string]: boolean } = {};

  constructor(
    private feedSupplierService: FeedSupplierService,
    private router: Router,
    private auth: Auth
  ) {}

  ngOnInit(): void {
    const tenantId = this.auth.currentUser?.uid || 'default-tenant';
    this.supplier = createEmptySupplier(tenantId);

    // Initialize selectedProducts object
    this.availableProducts.forEach(product => {
      this.selectedProducts[product] = false;
    });
  }

  onSubmit(form: NgForm) {
    if (form.invalid) {
      return;
    }

    // Build productsOffered array from selected checkboxes
    this.supplier.productsOffered = Object.keys(this.selectedProducts)
      .filter(product => this.selectedProducts[product]);

    this.feedSupplierService.createSupplier(this.supplier)
      .subscribe({
        next: (supplierId) => {
          console.log('Feed supplier created successfully!', supplierId);
          this.router.navigate(['/admin/feed-suppliers']);
        },
        error: (error) => {
          console.error('Error creating feed supplier:', error);
        }
      });
  }

  onCancel() {
    this.router.navigate(['/admin/feed-suppliers']);
  }
}
