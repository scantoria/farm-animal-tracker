// src/app/animals/animal.model.ts

import { DocumentReference } from 'firebase/firestore';

export interface Animal {
  id?: string;
  name: string;
  species: string;
  breed: string;
  dob: Date; // date of birth
  sex: 'Male' | 'Female';
  registrationNumber?: string;
  microchipId?: string;
  status: string;
  sireId?: string;
  damId?: string;
  currentFarmId?: string;
  // A DocumentReference is a pointer to another document.
  // We will add logic later to handle these relationships.
  sireRef?: DocumentReference;
  damRef?: DocumentReference;
  currentFarmRef?: DocumentReference;
}