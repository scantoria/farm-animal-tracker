// src/app/shared/models/feed-supplier.model.ts

import { Timestamp } from '@angular/fire/firestore';

export interface SupplierContact {
  contactPerson?: string;
  phone?: string;
  email?: string;
  alternatePhone?: string;
}

export interface SupplierAddress {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface FeedSupplier {
  id?: string;
  tenantId: string;
  name: string;
  contact: SupplierContact;
  address: SupplierAddress;
  productsOffered: string[];  // ["Round Bales Hay", "Square Bales", "Grain", "Supplements", "Minerals"]
  deliveryAvailable: boolean;
  minimumOrder?: number;      // Minimum order quantity
  notes?: string;
  isActive: boolean;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Farm-Supplier relationship (junction table)
export interface FarmSupplier {
  id?: string;
  tenantId: string;
  farmId: string;
  farmName?: string;          // Denormalized for display
  supplierId: string;
  supplierName?: string;      // Denormalized for display
  isPrimary: boolean;         // Is this the primary supplier for this farm?
  deliveryNotes?: string;     // Special instructions for this farm
  createdAt?: Timestamp;
}

// Feed Order tracking
export interface FeedOrderItem {
  productName: string;
  quantity: number;
  unit: string;              // "bales", "bags", "tons"
  pricePerUnit?: number;
  totalPrice?: number;
}

export interface FeedOrder {
  id?: string;
  tenantId: string;
  farmId: string;
  farmName?: string;          // Denormalized
  supplierId: string;
  supplierName?: string;      // Denormalized
  orderDate: string | Timestamp;
  deliveryDate?: string | Timestamp;
  items: FeedOrderItem[];
  totalCost?: number;
  status: 'pending' | 'in-transit' | 'delivered' | 'cancelled';
  deliveredBy?: string;       // Driver/delivery person
  notes?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Common product types
export const COMMON_FEED_PRODUCTS = [
  'Round Bales - Hay',
  'Square Bales - Hay',
  'Alfalfa Hay',
  'Grass Hay',
  'Mixed Hay',
  'Grain - Corn',
  'Grain - Oats',
  'Sweet Feed',
  'Pellets - Cattle',
  'Pellets - Horse',
  'Mineral Supplement',
  'Salt Block',
  'Protein Supplement',
  'Calf Starter',
  'Other'
];

// Helper to create empty supplier
export function createEmptySupplier(tenantId: string): Partial<FeedSupplier> {
  return {
    tenantId,
    name: '',
    contact: {
      contactPerson: '',
      phone: '',
      email: '',
      alternatePhone: ''
    },
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    productsOffered: [],
    deliveryAvailable: false,
    notes: '',
    isActive: true
  };
}

// Helper to create empty order
export function createEmptyFeedOrder(
  tenantId: string,
  farmId: string,
  supplierId: string
): Partial<FeedOrder> {
  return {
    tenantId,
    farmId,
    supplierId,
    orderDate: new Date().toISOString().substring(0, 10),
    items: [],
    status: 'pending',
    notes: ''
  };
}