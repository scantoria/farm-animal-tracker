import { DocumentReference } from '@angular/fire/firestore';

export interface BirthingSchedule {
  id?: string;
  animalRef: DocumentReference; // Reference to the DAM (mother) animal record

  // Birth Event Details
  species: string; // 'Equine' | 'Bovine' | 'Capra hircus' | 'Ovis aries';
  calvingEase: string; // e.g., 'Easy', 'Assisted', 'Hard Pull'
  notes?: string;
  
  // Offspring Details (Directly aligns with your request)
  tagInfo: string; // The tag number or name of the new animal
  dob: string; // The date of birth (same as birthDate from previous design)
  dam: string; // The ID or name of the mother (Redundant with animalRef but useful for display/data consistency)
  sire: string; // The ID or name of the father
  sex: string; // 'bull', 'heifer', 'colt', 'filly', 'doe', 'buck', 'ewe', 'ram'
  birthWeight: string; // The weight of the calf at birth (string to accommodate units or N/A)
  breed: string; // The breed of the offspring
}