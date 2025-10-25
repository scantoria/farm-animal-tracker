import { Injectable } from '@angular/core';
import { 
  Firestore
  , collection
  , collectionData
  , doc
  , docData
  , addDoc
  , deleteDoc
  , updateDoc
  , CollectionReference
  , DocumentData 
  , DocumentReference
} from '@angular/fire/firestore';
import { from, Observable } from 'rxjs'; 
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

  getRecordsByAnimalId(animalId: string): Observable<MedicationRecord[]> {
    const recordsCollection = collection(
      this.firestore, 
      `animals/${animalId}/medicationRecords`
    ) as CollectionReference<MedicationRecord>;
    
    // We use { idField: 'id' } to ensure the document ID is included in the model.
    return collectionData(recordsCollection, { idField: 'id' });
  }
  
  getRecord(animalId: string, recordId: string): Observable<MedicationRecord> {
    const recordDoc = doc(
      this.firestore, 
      `animals/${animalId}/medicationRecords/${recordId}`
    ) as DocumentReference<MedicationRecord>;

    return docData(recordDoc, { idField: 'id' }) as Observable<MedicationRecord>;
  }

  updateRecord(animalId: string, recordId: string, record: Partial<MedicationRecord>): Observable<void> {
    const recordDoc: DocumentReference<DocumentData> = doc(
      this.firestore, 
      `animals/${animalId}/medicationRecords/${recordId}`
    );
    
    // updateDoc uses the partial object to merge changes without overwriting the whole document.
    return from(updateDoc(recordDoc, record as DocumentData));
  }
  
  deleteRecord(animalId: string, recordId: string): Observable<void> {
    const recordDoc = doc(
      this.firestore, 
      `animals/${animalId}/medicationRecords/${recordId}`
    );
    
    return from(deleteDoc(recordDoc));
  }
}
