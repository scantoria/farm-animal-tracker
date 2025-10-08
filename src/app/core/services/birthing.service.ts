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
import { BirthingSchedule } from '../../shared/models/birthing-schedule.model';

@Injectable({
  providedIn: 'root',
})
export class BirthingService {
  constructor(private firestore: Firestore) {}

  // CREATE
  addBirthingRecord(animalId: string, record: BirthingSchedule) {
    const recordsCollection = collection(this.firestore, `animals/${animalId}/birthingSchedules`);
    return from(addDoc(recordsCollection, record));
  }

  // READ (List)
  getBirthingRecordsByAnimalId(animalId: string): Observable<BirthingSchedule[]> {
    const recordsCollection = collection(this.firestore, `animals/${animalId}/birthingSchedules`);
    return collectionData(recordsCollection, { idField: 'id' }).pipe(
      map((records) => records as BirthingSchedule[])
    );
  }

  // READ (Single)
  getBirthingRecord(animalId: string, recordId: string): Observable<BirthingSchedule> {
    const docRef = doc(this.firestore, `animals/${animalId}/birthingSchedules/${recordId}`);
    return from(getDoc(docRef)).pipe(
      map((docSnap) => {
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() } as BirthingSchedule;
        } else {
          throw new Error('Birthing record not found');
        }
      })
    );
  }

  // UPDATE
  updateBirthingRecord(animalId: string, recordId: string, updatedRecord: Partial<BirthingSchedule>) {
    const docRef = doc(this.firestore, `animals/${animalId}/birthingSchedules/${recordId}`);
    return from(updateDoc(docRef, updatedRecord));
  }

  // DELETE
  deleteBirthingRecord(animalId: string, recordId: string) {
    const docRef = doc(this.firestore, `animals/${animalId}/birthingSchedules/${recordId}`);
    return from(deleteDoc(docRef));
  }
}