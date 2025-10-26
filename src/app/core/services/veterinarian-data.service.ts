// src/app/core/services/veterinarian-data.service.ts

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
import { Veterinarian } from '../../shared/models/veterinarian.model';

@Injectable({
  providedIn: 'root'
})
export class VeterinarianDataService {
  private veterinarianCollection: CollectionReference<DocumentData>;

  constructor(private firestore: Firestore) {
    this.veterinarianCollection = collection(this.firestore, 'veterinarians');
  }

  addVeterinarian(veterinarian: Omit<Veterinarian, 'id'>): Observable<DocumentReference<DocumentData>> {
    return from(addDoc(this.veterinarianCollection, veterinarian));
  }

  getAllVeterinarians(): Observable<Veterinarian[]> {
    return collectionData(this.veterinarianCollection as CollectionReference<Veterinarian>, { idField: 'id' });
  }

  getVeterinarian(id: string): Observable<Veterinarian> {
    const docRef = doc(this.firestore, `veterinarians/${id}`) as DocumentReference<Veterinarian>;
    return docData(docRef, { idField: 'id' }) as Observable<Veterinarian>;
  }

  updateVeterinarian(id: string, veterinarian: Partial<Veterinarian>): Observable<void> {
    const docRef: DocumentReference<DocumentData> = doc(this.firestore, `veterinarians/${id}`);
    return from(updateDoc(docRef, veterinarian as DocumentData));
  }

  deleteVeterinarian(id: string): Observable<void> {
    const docRef = doc(this.firestore, `veterinarians/${id}`);
    return from(deleteDoc(docRef));
  }
}