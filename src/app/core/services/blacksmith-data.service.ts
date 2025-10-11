import { Injectable } from '@angular/core';
import { 
  Firestore, 
  collection, 
  collectionData, 
  doc, 
  addDoc, 
  deleteDoc,
  updateDoc,
  getDoc
} from '@angular/fire/firestore';
import { Observable, from, map } from 'rxjs';
import { Blacksmith } from '../../shared/models/blacksmith.model';

@Injectable({
  providedIn: 'root',
})
export class BlacksmithDataService {
   private blacksmithsCollection: any; 

  constructor(private firestore: Firestore) {
    this.blacksmithsCollection = collection(this.firestore, 'blacksmiths');
  }

  // CREATE
  addBlacksmith(blacksmith: Blacksmith) {
    // Firestore generates the ID
    return from(addDoc(this.blacksmithsCollection, blacksmith));
  }

  // READ (List all blacksmiths)
  getAllBlacksmiths(): Observable<Blacksmith[]> {
    // Retrieves the list of blacksmiths from the top-level collection
    return collectionData(this.blacksmithsCollection, { idField: 'id' }).pipe(
      map(data => data as Blacksmith[])
    );
  }

  // READ (Single blacksmith by ID)
  getBlacksmith(id: string): Observable<Blacksmith> {
    const docRef = doc(this.blacksmithsCollection, id);
    return from(getDoc(docRef)).pipe(
      map(docSnap => {
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() } as Blacksmith;
        } else {
          throw new Error('Blacksmith not found');
        }
      })
    );
  }

  // UPDATE
  updateBlacksmith(id: string, updatedData: Partial<Blacksmith>) {
    const docRef = doc(this.blacksmithsCollection, id);
    return from(updateDoc(docRef, updatedData));
  }

  // DELETE
  deleteBlacksmith(id: string) {
    const docRef = doc(this.blacksmithsCollection, id);
    return from(deleteDoc(docRef));
  }
}