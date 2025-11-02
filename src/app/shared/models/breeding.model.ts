// src/app/shared/models/breeding.model.ts

import { DocumentReference, Timestamp } from '@angular/fire/firestore';

export interface BreedingEvent {
  id?: string; // Optional Firestore document ID
  date: string | Timestamp | any; // The date of the breeding event (can be string or Firestore Timestamp)
  eventType: string; // e.g., 'Heat Detected', 'Breeding'
  associatedAnimalRef?: DocumentReference; // A reference to the sire or dam
  notes: string;
}