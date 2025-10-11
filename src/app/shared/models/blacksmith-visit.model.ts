import { DocumentReference } from '@angular/fire/firestore';

export interface BlacksmithVisit {
  id?: string;
  animalRef: DocumentReference; 
  visitDate: string;
  serviceProvided: string; 
  nextAppointmentDate?: string; 
  provider: string;
  notes?: string;
}
/*
serviceProvided: string; // e.g., 'Trim', 'Shoeing-Front', 'Shoeing-Full', 'Corrective'
  nextAppointmentDate?: string; 
  
  // Reference to the Blacksmith in the top-level 'blacksmiths' collection
  blacksmithRef: DocumentReference;
  notes?: string;

*/