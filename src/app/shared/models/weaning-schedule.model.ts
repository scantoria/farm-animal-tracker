import { DocumentReference } from '@angular/fire/firestore';

export interface WeaningSchedule {
  id?: string;
  animalRef: DocumentReference; 
  weanDate: string; // The date the animal was weaned
  method: string; // e.g., 'Abrupt', 'Fence-line', 'Two-stage'
  notes?: string;
}