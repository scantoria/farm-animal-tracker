// src/app/animals.service.ts

import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, doc, getDoc, updateDoc, deleteDoc, collectionData, query, where } from '@angular/fire/firestore';
import { from, Observable, forkJoin, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { Animal, AnimalLineage } from '../../shared/models/animal.model';

@Injectable({
  providedIn: 'root'
})
export class AnimalsService {

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
    // Remove undefined values as Firestore doesn't accept them
    const cleanedData = Object.fromEntries(
      Object.entries(animalData).filter(([_, value]) => value !== undefined)
    );
    return from(updateDoc(animalDocRef, cleanedData));
  }

  // Delete an animal
  deleteAnimal(animal: Animal) {
    if (!animal.id) {
      return from(Promise.reject('Animal ID is required for delete.'));
    }
    const animalDocRef = doc(this.firestore, `animals/${animal.id}`);
    return from(deleteDoc(animalDocRef));
  }

  // Get animals by sex (for selecting potential sires/dams)
  getAnimalsBySex(sex: 'male' | 'female'): Observable<Animal[]> {
    const animalsCollection = collection(this.firestore, 'animals');
    const q = query(animalsCollection, where('sex', '==', sex));
    return collectionData(q, { idField: 'id' }) as Observable<Animal[]>;
  }

  // Get potential sires (male animals)
  getPotentialSires(): Observable<Animal[]> {
    return this.getAnimalsBySex('male');
  }

  // Get potential dams (female animals)
  getPotentialDams(): Observable<Animal[]> {
    return this.getAnimalsBySex('female');
  }

  // Get animal lineage with parents and grandparents
  getAnimalLineage(animalId: string): Observable<AnimalLineage | undefined> {
    return this.getAnimal(animalId).pipe(
      switchMap(animal => {
        if (!animal) {
          return of(undefined);
        }

        // Fetch parents
        const sire$ = animal.sireId ? this.getAnimal(animal.sireId) : of(undefined);
        const dam$ = animal.damId ? this.getAnimal(animal.damId) : of(undefined);

        return forkJoin([sire$, dam$]).pipe(
          switchMap(([sire, dam]) => {
            // Fetch grandparents
            const paternalGrandsire$ = sire?.sireId ? this.getAnimal(sire.sireId) : of(undefined);
            const paternalGranddam$ = sire?.damId ? this.getAnimal(sire.damId) : of(undefined);
            const maternalGrandsire$ = dam?.sireId ? this.getAnimal(dam.sireId) : of(undefined);
            const maternalGranddam$ = dam?.damId ? this.getAnimal(dam.damId) : of(undefined);

            return forkJoin([
              paternalGrandsire$,
              paternalGranddam$,
              maternalGrandsire$,
              maternalGranddam$
            ]).pipe(
              map(([paternalGrandsire, paternalGranddam, maternalGrandsire, maternalGranddam]) => ({
                animal,
                sire,
                dam,
                paternalGrandsire,
                paternalGranddam,
                maternalGrandsire,
                maternalGranddam
              }))
            );
          })
        );
      })
    );
  }
}