// src/app/core/services/veterinarian-data.service.ts

import { Injectable } from '@angular/core';
import { Firestore, collection, collectionData } from '@angular/fire/firestore';
import { Observable } from 'rxjs';
import { Veterinarian } from '../../shared/models/veterinarian.model'; // 👈 Check this path

@Injectable({
  providedIn: 'root' // Ensures the service is available throughout your application
})
export class VeterinarianDataService {

  constructor(private firestore: Firestore) { }

  /**
   * Fetches all veterinarians from the Firestore 'veterinarians' collection.
   * Uses { idField: 'id' } to include the Firestore Document ID in the object.
   */
  getAllVeterinarians(): Observable<Veterinarian[]> {
    // 1. Get a reference to the 'veterinarians' collection
    const vetsCollection = collection(this.firestore, 'veterinarians');
    
    // 2. Use collectionData to stream the documents
    return collectionData(vetsCollection, { idField: 'id' }) as Observable<Veterinarian[]>;
  }
}