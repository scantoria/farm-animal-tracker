// src/app/shared/models/castration.model.ts

import { DocumentReference, Timestamp } from '@angular/fire/firestore';

export interface Castration {
  id?: string; // Optional Firestore document ID
  animalRef: DocumentReference; // Link to health event
  eventDate: string | Timestamp;
  essential_timing: boolean;
  method: string; // 'surgical' | 'banding' | 'burdizzo'
  ageAtCastration: string; // Age in months
  performedBy: string;
  complications?: boolean;
  recoveryNotes?: string;
  updatedAt?: Timestamp;
}

export const CASTRATION_METHODS = [
  'surgical',
  'banding',
  'burdizzo'
];
