// src/app/shared/models/birth-event.model.ts

import { Timestamp } from '@angular/fire/firestore';

/**
 * BirthEvent model for recording calf births.
 * When a birth is recorded, a new Animal (the calf) is automatically created.
 * Stored as subcollection: animals/{damId}/birthEvents/{eventId}
 */
export interface BirthEvent {
  id?: string;
  tenantId: string;
  damId: string;              // Mother cow's animal ID
  calfId: string;             // Newly created calf's animal ID
  sireId?: string;            // Father (from animals or external sires)
  sireType?: 'animal' | 'external';  // Whether sire is from animals collection or sires collection
  birthDate: string | Timestamp;
  birthWeight?: number;       // lbs
  sex: 'Bull' | 'Heifer';
  calvingEase?: CalvingEase;
  notes?: string;
  createdAt?: Timestamp;
  createdBy: string;
}

export type CalvingEase = 'Easy' | 'Assisted' | 'Hard Pull' | 'Caesarean';

export const CALVING_EASE_OPTIONS: CalvingEase[] = [
  'Easy',
  'Assisted',
  'Hard Pull',
  'Caesarean'
];
