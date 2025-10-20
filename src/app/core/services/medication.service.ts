import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, CollectionReference, DocumentData } from '@angular/fire/firestore';
import { from, Observable } from 'rxjs'; // Use 'from' to convert the promise to an Observable
import { MedicationRecord } from '../../shared/models/medication-record.model'; 

@Injectable({
  providedIn: 'root'
})
export class MedicationService {
  constructor(private firestore: Firestore) { }

  addRecord(animalId: string, record: MedicationRecord): Observable<any> {
    const recordsCollectionRef: CollectionReference<DocumentData> = collection(
      this.firestore, 
      `animals/${animalId}/medicationRecords`
    );

    return from(addDoc(recordsCollectionRef, record));
  }

  // You would also include methods for:
  // getRecordsByAnimalId(animalId: string): Observable<MedicationRecord[]>
  // getRecord(animalId: string, recordId: string): Observable<MedicationRecord>
  // updateRecord(animalId: string, recordId: string, record: Partial<MedicationRecord>): Observable<void>
  // deleteRecord(animalId: string, recordId: string): Observable<void>
}
