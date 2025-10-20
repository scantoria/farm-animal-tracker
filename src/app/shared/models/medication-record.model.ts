import { DocumentReference } from 'firebase/firestore';

export interface MedicationRecord {
  id?: string;
  animalRef: DocumentReference;
  visitDate: string;
  provider: string; // name of the veterinarian
  treatmentType: string // e.g., 'Vaccination', 'Deworming', 'Injury Treatment'
  medicationName: string;
  dosage: string;
  notes?: string;
}