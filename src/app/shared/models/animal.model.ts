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
  
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

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