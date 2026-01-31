// src/app/shared/models/animal.model.ts (Updated)

import { Timestamp, DocumentReference } from '@angular/fire/firestore';

export interface Animal {
  id?: string;
  tenantId: string;
  name: string;
  species: string;
  breed: string;
  identifier: string;  // Ear tag, brand, etc.
  dob: string | Timestamp;
  sex: 'male' | 'female';
  status: 'active' | 'sold' | 'deceased';

  // PROFILE IMAGE
  imageUrl?: string;
  imageStoragePath?: string;

  // REPRODUCTIVE STATUS
  reproductiveStatus?: 'open' | 'pregnant' | 'intact' | 'castrated' | 'unknown';

  // FARM LOCATION - NEW FIELDS
  currentFarmId?: string;           // Reference to farm ID
  currentFarmRef?: DocumentReference;  // Firebase document reference
  currentFarmName?: string;         // Denormalized for display
  
  // Parent information
  sireId?: string;
  damId?: string;
  
  // Additional fields
  purchaseDate?: string | Timestamp;
  purchasePrice?: number;
  currentWeight?: number;
  notes?: string;

  // Growth Tracking Fields
  birthWeight?: number;                 // Birth weight in lbs
  lastWeighDate?: string | Timestamp;   // Date of most recent weight record
  enrolledInGrowthTracking?: boolean;   // Whether calf is being tracked for growth/sale
  growthStatus?: GrowthStatus;          // Current growth tracking status
  saleDate?: string | Timestamp;        // Date animal was sold
  saleWeight?: number;                  // Weight at sale (lbs)
  salePrice?: number;                   // Sale price
  averageADG?: number;                  // Overall average daily gain

  // Offspring Tracking (for dams)
  offspringIds?: string[];              // IDs of offspring (calves)
  lastCalvingDate?: string | Timestamp; // Date of most recent calving
  lactationStatus?: boolean;            // Whether currently lactating

  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export type GrowthStatus = 'active' | 'ready-for-sale' | 'sold';

// Lineage interface for displaying bloodline information
export interface AnimalLineage {
  animal: Animal;
  sire?: Animal;
  dam?: Animal;
  paternalGrandsire?: Animal;
  paternalGranddam?: Animal;
  maternalGrandsire?: Animal;
  maternalGranddam?: Animal;
}

// Simplified parent info for display
export interface ParentInfo {
  id: string;
  name: string;
}

// Type guards
export function isAnimal(obj: any): obj is Animal {
  return obj && typeof obj.name === 'string' && typeof obj.species === 'string';
}