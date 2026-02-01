// src/app/core/services/hormone-treatment.service.ts
import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp
} from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

export interface StandaloneHormoneTreatment {
  id?: string;
  animalId: string;
  treatmentDate: string;
  hormoneType: string;
  protocol?: string;
  dosage?: string;
  dosageUnit?: string;
  expectedBreedingDate?: string;
  administeredBy?: string;
  notes?: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

// Hormone protocols with their typical wait times before breeding
export const HORMONE_PROTOCOLS = [
  { value: 'cidr', label: 'CIDR (Controlled Internal Drug Release)', waitDays: 7 },
  { value: 'pg', label: 'PG (Prostaglandin)', waitDays: 3 },
  { value: 'gnrh', label: 'GnRH (Gonadotropin-Releasing Hormone)', waitDays: 2 },
  { value: 'estrus_sync', label: 'Estrus Synchronization Protocol', waitDays: 5 },
  { value: 'ovsynch', label: 'Ovsynch Protocol', waitDays: 10 },
  { value: 'cosynch', label: 'CO-Synch Protocol', waitDays: 10 },
  { value: 'other', label: 'Other/Custom', waitDays: 0 }
];

@Injectable({
  providedIn: 'root'
})
export class HormoneTreatmentService {

  constructor(private firestore: Firestore) {}

  private getCollectionPath(animalId: string): string {
    return `animals/${animalId}/hormoneTreatments`;
  }

  /**
   * Get all hormone treatments for an animal
   */
  getTreatmentsByAnimalId(animalId: string): Observable<StandaloneHormoneTreatment[]> {
    const treatmentsCollection = collection(this.firestore, this.getCollectionPath(animalId));
    const q = query(treatmentsCollection, orderBy('treatmentDate', 'desc'));
    return collectionData(q, { idField: 'id' }).pipe(
      map((treatments) => treatments as StandaloneHormoneTreatment[])
    );
  }

  /**
   * Add a new hormone treatment
   */
  addTreatment(animalId: string, treatment: StandaloneHormoneTreatment): Observable<string> {
    const treatmentsCollection = collection(this.firestore, this.getCollectionPath(animalId));
    const treatmentData = {
      ...treatment,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };
    return from(addDoc(treatmentsCollection, treatmentData)).pipe(
      map((docRef) => docRef.id)
    );
  }

  /**
   * Update an existing hormone treatment
   */
  updateTreatment(animalId: string, treatmentId: string, treatment: Partial<StandaloneHormoneTreatment>): Observable<void> {
    const treatmentDocRef = doc(this.firestore, `${this.getCollectionPath(animalId)}/${treatmentId}`);
    const updateData = {
      ...treatment,
      updatedAt: Timestamp.now()
    };
    return from(updateDoc(treatmentDocRef, updateData));
  }

  /**
   * Delete a hormone treatment
   */
  deleteTreatment(animalId: string, treatmentId: string): Observable<void> {
    const treatmentDocRef = doc(this.firestore, `${this.getCollectionPath(animalId)}/${treatmentId}`);
    return from(deleteDoc(treatmentDocRef));
  }

  /**
   * Calculate expected breeding date based on treatment date and protocol
   */
  calculateExpectedBreedingDate(treatmentDate: string, protocolValue: string): string {
    const protocol = HORMONE_PROTOCOLS.find(p => p.value === protocolValue);
    if (!protocol || protocol.waitDays === 0) {
      return '';
    }

    const date = new Date(treatmentDate);
    date.setDate(date.getDate() + protocol.waitDays);
    return date.toISOString().split('T')[0];
  }
}
