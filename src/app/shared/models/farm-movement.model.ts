// src/app/shared/models/farm-movement.model.ts

import { Timestamp, DocumentReference } from '@angular/fire/firestore';

export type MovementReason = 
  | 'Winter Housing'
  | 'Summer Grazing'
  | 'Weaning'
  | 'Breeding'
  | 'Working/Processing'
  | 'Medical Treatment'
  | 'Sale Preparation'
  | 'Quarantine'
  | 'Other';

export interface FarmMovement {
  id?: string;
  tenantId: string;
  animalId: string;
  animalRef?: DocumentReference;
  animalName?: string;  // Denormalized for easier display
  animalTag?: string;   // Denormalized for easier display
  fromFarmId: string | null;  // null if this is the first assignment
  fromFarmName?: string;      // Denormalized for easier display
  toFarmId: string;
  toFarmName?: string;        // Denormalized for easier display
  movementDate: string | Timestamp;  // Date of the move
  reason?: MovementReason;
  movedBy: string;           // userId who performed the move
  movedByName?: string;      // Denormalized for easier display
  notes?: string;
  createdAt?: Timestamp;
}

// Helper to get all movement reasons
export const MOVEMENT_REASONS: MovementReason[] = [
  'Winter Housing',
  'Summer Grazing',
  'Weaning',
  'Breeding',
  'Working/Processing',
  'Medical Treatment',
  'Sale Preparation',
  'Quarantine',
  'Other'
];