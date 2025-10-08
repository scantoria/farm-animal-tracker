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
import { WeaningSchedule } from '../../shared/models/weaning-schedule.model';

@Injectable({
  providedIn: 'root',
})
export class WeaningService {
  constructor(private firestore: Firestore) {}

  // CREATE
  addWeaningRecord(animalId: string, record: WeaningSchedule) {
    const recordsCollection = collection(this.firestore, `animals/${animalId}/weaningSchedules`);
    return from(addDoc(recordsCollection, record));
  }

  // READ (List)
  getWeaningRecordsByAnimalId(animalId: string): Observable<WeaningSchedule[]> {
    const recordsCollection = collection(this.firestore, `animals/${animalId}/weaningSchedules`);
    return collectionData(recordsCollection, { idField: 'id' }).pipe(
      map((records) => records as WeaningSchedule[])
    );
  }

  // READ (Single)
  getWeaningRecord(animalId: string, recordId: string): Observable<WeaningSchedule> {
    const docRef = doc(this.firestore, `animals/${animalId}/weaningSchedules/${recordId}`);
    return from(getDoc(docRef)).pipe(
      map((docSnap) => {
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() } as WeaningSchedule;
        } else {
          throw new Error('Weaning record not found');
        }
      })
    );
  }

  // UPDATE
  updateWeaningRecord(animalId: string, recordId: string, updatedRecord: Partial<WeaningSchedule>) {
    const docRef = doc(this.firestore, `animals/${animalId}/weaningSchedules/${recordId}`);
    return from(updateDoc(docRef, updatedRecord));
  }

  // DELETE
  deleteWeaningRecord(animalId: string, recordId: string) {
    const docRef = doc(this.firestore, `animals/${animalId}/weaningSchedules/${recordId}`);
    return from(deleteDoc(docRef));
  }
}