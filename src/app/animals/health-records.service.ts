// src/app/animals/health-records.service.ts

import { Injectable } from '@angular/core';
import { Firestore, collection, doc, addDoc, collectionData, docData, updateDoc, deleteDoc, DocumentReference } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { HealthRecord } from './health-record.model';

@Injectable({
  providedIn: 'root'
})
export class HealthRecordsService {

  constructor(private firestore: Firestore) { }

  private getHealthRecordsCollection(animalId: string) {
    // This method returns a reference to the 'healthRecords' subcollection for a specific animal.
    return collection(this.firestore, `animals/${animalId}/healthRecords`);
  }

  // Add a new health record to an animal's subcollection
  addHealthRecord(animalId: string, record: HealthRecord): Observable<DocumentReference<unknown>> {
    const healthRecordsCollection = this.getHealthRecordsCollection(animalId);
    const { id, ...recordData } = record;
    return from(addDoc(healthRecordsCollection, recordData));
  }

  // Get all health records for a specific animal
  getAllHealthRecords(animalId: string): Observable<HealthRecord[]> {
    const healthRecordsCollection = this.getHealthRecordsCollection(animalId);
    return collectionData(healthRecordsCollection, { idField: 'id' }) as Observable<HealthRecord[]>;
  }

  // Get a single health record by its ID
  getHealthRecord(animalId: string, recordId: string): Observable<HealthRecord> {
    const recordDocRef = doc(this.firestore, `animals/${animalId}/healthRecords/${recordId}`);
    return docData(recordDocRef, { idField: 'id' }) as Observable<HealthRecord>;
  }

  // Update an existing health record
  updateHealthRecord(animalId: string, record: HealthRecord): Observable<void> {
    if (!record.id) {
      return from(Promise.reject('Record ID is required for update.'));
    }
    const recordDocRef = doc(this.firestore, `animals/${animalId}/healthRecords/${record.id}`);
    const { id, ...recordData } = record;
    return from(updateDoc(recordDocRef, recordData));
  }

  // Delete a health record
  deleteHealthRecord(animalId: string, recordId: string): Observable<void> {
    const recordDocRef = doc(this.firestore, `animals/${animalId}/healthRecords/${recordId}`);
    return from(deleteDoc(recordDocRef));
  }
}