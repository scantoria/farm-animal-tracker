import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  collectionData
} from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { VeterinarianVisit } from '../../shared/models/veterinarian-visit.model';

@Injectable({
  providedIn: 'root',
})
export class VeterinarianVisitService {
  constructor(private firestore: Firestore) {}

  // READ (List) - Get all veterinarian visits for an animal
  getVisitsByAnimalId(animalId: string): Observable<VeterinarianVisit[]> {
    const recordsCollection = collection(this.firestore, `animals/${animalId}/veterinarianVisits`);
    return collectionData(recordsCollection, { idField: 'id' }).pipe(
      map((records) => records as VeterinarianVisit[])
    );
  }

  // READ (Single) - Get a specific visit record
  getVisitRecord(animalId: string, recordId: string): Observable<VeterinarianVisit> {
    const docRef = doc(this.firestore, `animals/${animalId}/veterinarianVisits/${recordId}`);
    return from(getDoc(docRef)).pipe(
      map((docSnap) => {
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() } as VeterinarianVisit;
        } else {
          throw new Error('Veterinarian visit record not found');
        }
      })
    );
  }

  // CREATE - Add a new visit record
  addVisitRecord(animalId: string, record: VeterinarianVisit) {
    const recordsCollection = collection(this.firestore, `animals/${animalId}/veterinarianVisits`);
    return from(addDoc(recordsCollection, record));
  }

  // UPDATE - Update an existing visit record
  updateVisitRecord(animalId: string, recordId: string, updatedRecord: Partial<VeterinarianVisit>) {
    const docRef = doc(this.firestore, `animals/${animalId}/veterinarianVisits/${recordId}`);
    return from(updateDoc(docRef, updatedRecord));
  }

  // DELETE - Delete a visit record
  deleteVisitRecord(animalId: string, recordId: string) {
    const docRef = doc(this.firestore, `animals/${animalId}/veterinarianVisits/${recordId}`);
    return from(deleteDoc(docRef));
  }
}
