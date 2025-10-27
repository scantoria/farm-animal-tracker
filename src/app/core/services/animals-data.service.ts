// src/app/animals.service.ts

import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, doc, getDoc, updateDoc, deleteDoc, collectionData } from '@angular/fire/firestore';
import { from, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Animal } from '../../shared/models/animal.model';

@Injectable({
  providedIn: 'root'
})
export class AnimalDataService {

  constructor(private firestore: Firestore) { }

  addAnimal(animal: Animal) {
    const animalsCollection = collection(this.firestore, 'animals');
    const { id, ...animalData } = animal;
    return from(addDoc(animalsCollection, animalData));
  }

  // Get all animals
  getAll(): Observable<Animal[]> {
    const animalsCollection = collection(this.firestore, 'animals');
    return collectionData(animalsCollection, { idField: 'id' }) as Observable<Animal[]>;
  }

  // Get a single animal by its ID
  getAnimal(animalId: string): Observable<Animal | undefined> {
    const animalDocRef = doc(this.firestore, `animals/${animalId}`);
    return from(getDoc(animalDocRef)).pipe(
      map(docSnap => {
        if (docSnap.exists()) {
          const data = docSnap.data() as Omit<Animal, 'id'>;
          return { ...data, id: docSnap.id };
        } else {
          return undefined;
        }
      })
    );
  }

  // Update an animal
  updateAnimal(animal: Animal) {
    if (!animal.id) {
      return from(Promise.reject('Animal ID is required for update.'));
    }
    const animalDocRef = doc(this.firestore, `animals/${animal.id}`);
    const { id, ...animalData } = animal;
    return from(updateDoc(animalDocRef, animalData));
  }

  // Delete an animal
  deleteAnimal(animal: Animal) {
    if (!animal.id) {
      return from(Promise.reject('Animal ID is required for delete.'));
    }
    const animalDocRef = doc(this.firestore, `animals/${animal.id}`);
    return from(deleteDoc(animalDocRef));
  }
}