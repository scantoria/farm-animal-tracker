// src/app/shared/models/breeding.model.ts

import { DocumentReference } from '@angular/fire/firestore';

export interface BreedingEvent {
  id?: string; // Optional Firestore document ID
  date: string; // The date of the breeding event
  eventType: string; // e.g., 'Heat Detected', 'Breeding'
  associatedAnimalRef?: DocumentReference; // A reference to the sire or dam
  notes: string;
}