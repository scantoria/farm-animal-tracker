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

// Type guards
export function isAnimal(obj: any): obj is Animal {
  return obj && typeof obj.name === 'string' && typeof obj.species === 'string';
}