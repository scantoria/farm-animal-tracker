// src/app/shared/models/farm.model.ts

import { Timestamp } from '@angular/fire/firestore';

export interface FarmAddress {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface FarmFacilities {
  hasBarn: boolean;
  hayStorageCapacity?: number;  // Number of round bales
  hasCattleChute: boolean;
  hasLoadingRamp: boolean;
  hasWaterSource: boolean;
  hasShelter: boolean;
  notes?: string;
}

export interface Farm {
  id?: string;
  tenantId: string;
  name: string;
  address: FarmAddress;
  acreage: number;
  facilities: FarmFacilities;
  isActive: boolean;  // Can be used to archive old farms
  
  // Calculated/Display fields (not stored in DB)
  currentAnimalCount?: number;
  primarySupplierName?: string;
  supplierCount?: number;
  
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Helper function to create a new farm with defaults
export function createEmptyFarm(tenantId: string): Partial<Farm> {
  return {
    tenantId,
    name: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    acreage: 0,
    facilities: {
      hasBarn: false,
      hayStorageCapacity: 0,
      hasCattleChute: false,
      hasLoadingRamp: false,
      hasWaterSource: false,
      hasShelter: false,
      notes: ''
    },
    isActive: true
  };
}