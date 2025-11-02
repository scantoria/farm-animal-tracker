// src/app/shared/models/hormone-treatment.model.ts

import { DocumentReference, Timestamp } from '@angular/fire/firestore';

export interface HormoneTreatment {
  id?: string;
  animalRef: DocumentReference;
  breedingEventRef: DocumentReference;
  treatmentDate: string | Timestamp | any;
  hormoneType: string; // e.g., 'Heat Synchronization', 'Ovulation Induction'
  productUsed: string;
  dosage: string;
  notes: string;
  administeredBy: string
}