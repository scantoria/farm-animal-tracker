// src/app/shared/models/pregnancy-check.model.ts

import { DocumentReference, Timestamp } from '@angular/fire/firestore';

export interface PregnancyCheck {
  id?: string; // Optional Firestore document ID
  breedingEventRef: DocumentReference; // A reference to the parent breeding event
  checkDate: string | Timestamp | any;
  result: string; // e.g., 'Pregnant', 'Open', 'Recheck Required'
  confirmationMethod: string; // e.g., 'Ultrasound', 'Blood Test'
  nextCheckDate?: string | Timestamp | any; // Optional: Date of the next recommended check
  notes?: string; // Optional: Any relevant notes or details
}