import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  //query,
  //where,
  collectionData,
} from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { HealthModel } from '../../shared/models/health.model';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class HealthService {
  constructor(private firestore: Firestore) {}

  addHealthRecord(animalId: string, healthModel: HealthModel) {
    const healthCollection = collection(
      this.firestore,
      'animals',
      animalId,
      'healthRecords'
    );
    return from(addDoc(healthCollection, healthModel));
  }

  getHealthRecordsByAnimalId(animalId: string): Observable<HealthModel[]> {
    const healthCollection = collection(
      this.firestore,
      'animals',
      animalId,
      'healthRecords'
    );
    return collectionData(healthCollection, { idField: 'id' }).pipe(
      map((records) => records as HealthModel[])
    );
  }

  getHealthRecord(animalId: string, recordId: string): Observable<HealthModel> {
    const healthDocRef = doc(
      this.firestore,
      'animals',
      animalId,
      'healthRecords',
      recordId
    );
    return from(
      getDoc(healthDocRef).then((docSnap) => {
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() } as HealthModel;
        } else {
          throw new Error('Health record not found');
        }
      })
    );
  }

  updateHealthRecord(
    animalId: string,
    recordId: string,
    updatedRecord: Partial<HealthModel>
  ) {
    const healthDocRef = doc(
      this.firestore,
      'animals',
      animalId,
      'healthRecords',
      recordId
    );
    return from(updateDoc(healthDocRef, updatedRecord));
  }

  deleteHealthRecord(animalId: string, recordId: string) {
    const healthDocRef = doc(
      this.firestore,
      'animals',
      animalId,
      'healthRecords',
      recordId
    );
    return from(deleteDoc(healthDocRef));
  }
}