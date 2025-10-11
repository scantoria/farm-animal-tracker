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
import { BlacksmithVisit } from '../../shared/models/blacksmith-visit.model';

@Injectable({
  providedIn: 'root',
})
export class BlacksmithService {
  constructor(private firestore: Firestore) {}

  // CREATE
  addVisitRecord(animalId: string, record: BlacksmithVisit) {
    const recordsCollection = collection(this.firestore, `animals/${animalId}/blacksmithVisits`);
    return from(addDoc(recordsCollection, record));
  }

  // READ (List)
  getVisitsByAnimalId(animalId: string): Observable<BlacksmithVisit[]> {
    const recordsCollection = collection(this.firestore, `animals/${animalId}/blacksmithVisits`);
    return collectionData(recordsCollection, { idField: 'id' }).pipe(
      map((records) => records as BlacksmithVisit[])
    );
  }

  // READ (Single)
  getVisitRecord(animalId: string, recordId: string): Observable<BlacksmithVisit> {
    const docRef = doc(this.firestore, `animals/${animalId}/blacksmithVisits/${recordId}`);
    return from(getDoc(docRef)).pipe(
      map((docSnap) => {
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() } as BlacksmithVisit;
        } else {
          throw new Error('Blacksmith visit record not found');
        }
      })
    );
  }

  // UPDATE
  updateVisitRecord(animalId: string, recordId: string, updatedRecord: Partial<BlacksmithVisit>) {
    const docRef = doc(this.firestore, `animals/${animalId}/blacksmithVisits/${recordId}`);
    return from(updateDoc(docRef, updatedRecord));
  }

  // DELETE
  deleteVisitRecord(animalId: string, recordId: string) {
    const docRef = doc(this.firestore, `animals/${animalId}/blacksmithVisits/${recordId}`);
    return from(deleteDoc(docRef));
  }
}