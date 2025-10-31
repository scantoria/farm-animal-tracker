import { DocumentReference } from '@angular/fire/firestore';

export interface VeterinarianVisit {
  id?: string;
  animalRef: DocumentReference;
  visitDate: string;
  veterinarianRef?: DocumentReference; // Reference to the Veterinarian in 'veterinarians' collection
  veterinarianName: string; // Store name for display purposes
  visitType: string; // 'Routine Checkup', 'Emergency', 'Vaccination', 'Surgery', 'Medication Administration', 'Other'
  diagnosis?: string;
  treatmentProvided?: string;
  medicationsAdministered?: string; // For controlled medications requiring vet administration
  nextAppointmentDate?: string;
  notes?: string;
}
