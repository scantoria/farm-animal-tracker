// src/app/core/services/sire.service.ts
import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where
} from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { Sire } from '../../shared/models/sire.model';

@Injectable({
  providedIn: 'root'
})
export class SireService {
  private readonly collectionName = 'sires';

  constructor(private firestore: Firestore) {}

  /**
   * Get all sires
   */
  getAll(): Observable<Sire[]> {
    const siresCollection = collection(this.firestore, this.collectionName);
    return collectionData(siresCollection, { idField: 'id' }).pipe(
      map((sires) => sires as Sire[])
    );
  }

  /**
   * Get sires by species
   */
  getSiresBySpecies(species: string): Observable<Sire[]> {
    const siresCollection = collection(this.firestore, this.collectionName);
    const q = query(siresCollection, where('species', '==', species));
    return collectionData(q, { idField: 'id' }).pipe(
      map((sires) => sires as Sire[])
    );
  }

  /**
   * Get only active sires
   */
  getActiveSires(): Observable<Sire[]> {
    const siresCollection = collection(this.firestore, this.collectionName);
    const q = query(siresCollection, where('status', '==', 'active'));
    return collectionData(q, { idField: 'id' }).pipe(
      map((sires) => sires as Sire[])
    );
  }

  /**
   * Get a single sire by ID
   */
  getSire(sireId: string): Observable<Sire | undefined> {
    const sireDocRef = doc(this.firestore, `${this.collectionName}/${sireId}`);
    return from(getDoc(sireDocRef)).pipe(
      map((docSnap) => {
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() } as Sire;
        }
        return undefined;
      })
    );
  }

  /**
   * Add a new sire
   */
  addSire(sire: Sire): Observable<string> {
    const siresCollection = collection(this.firestore, this.collectionName);
    const sireData = {
      ...sire,
      dateAdded: new Date().toISOString().split('T')[0]
    };
    return from(addDoc(siresCollection, sireData)).pipe(
      map((docRef) => docRef.id)
    );
  }

  /**
   * Update an existing sire
   */
  updateSire(sire: Sire): Observable<void> {
    if (!sire.id) {
      throw new Error('Sire ID is required for update');
    }
    const sireDocRef = doc(this.firestore, `${this.collectionName}/${sire.id}`);
    const { id, ...sireData } = sire;
    return from(updateDoc(sireDocRef, sireData));
  }

  /**
   * Delete a sire
   */
  deleteSire(sireId: string): Observable<void> {
    const sireDocRef = doc(this.firestore, `${this.collectionName}/${sireId}`);
    return from(deleteDoc(sireDocRef));
  }
}
