// src/app/shared/models/dehorning.model.ts

import { DocumentReference, Timestamp } from '@angular/fire/firestore';

export interface Dehorning {
  id?: string; // Optional Firestore document ID
  animalRef: DocumentReference; // Link to health event
  eventDate: string | Timestamp;
  method: string; // 'surgical' | 'caustic_paste' | 'hot_iron' | 'other'
  ageAtDehorning: string; // Age in months
  performedBy: string;
  complications?: boolean;
  recoveryNotes?: string;
  updatedAt?: Timestamp;
}

export const DEHORNING_METHODS = [
  'surgical',
  'caustic_paste',
  'hot_iron',
  'other'
];
