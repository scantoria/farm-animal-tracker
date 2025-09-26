// src/app/shared/models/hormone-treatment.model.ts

import { DocumentReference } from '@angular/fire/firestore';

export interface HormoneTreatment {
  id?: string; // Optional Firestore document ID
  animalRef: DocumentReference; // A reference to the animal that received the treatment
  treatmentDate: Date;
  type: string; // e.g., 'Heat Synchronization', 'Ovulation Induction'
  productUsed: string;
  dosage: string;
  comments: string;
}