// src/app/core/services/breeding.service.ts
import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  collectionData,
} from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import { BreedingEvent } from '../../shared/models/breeding.model';
import { PregnancyCheck } from '../../shared/models/pregnancy-check.model';
import { HormoneTreatment } from '../../shared/models/hormone-treatment.model';

@Injectable({
  providedIn: 'root',
})
export class BreedingService {
  constructor(private firestore: Firestore) {}

  // ** BreedingEvent CRUD **
  addBreedingEvent(animalId: string, breedingEvent: BreedingEvent) {
    const breedingEventsCollection = collection(this.firestore, `animals/${animalId}/breedingEvents`);
    return from(addDoc(breedingEventsCollection, breedingEvent));
  }

  getBreedingEventsByAnimalId(animalId: string): Observable<BreedingEvent[]> {
    const breedingEventsCollection = collection(this.firestore, `animals/${animalId}/breedingEvents`);
    return collectionData(breedingEventsCollection, { idField: 'id' }).pipe(
      map((records) => records as BreedingEvent[])
    );
  }

  getBreedingEvent(animalId: string, eventId: string): Observable<BreedingEvent> {
    const breedingEventDocRef = doc(this.firestore, `animals/${animalId}/breedingEvents/${eventId}`);
    return from(
      getDoc(breedingEventDocRef).then((docSnap) => {
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() } as BreedingEvent;
        } else {
          throw new Error('Breeding event not found');
        }
      })
    );
  }

  updateBreedingEvent(animalId: string, eventId: string, updatedEvent: Partial<BreedingEvent>) {
    const breedingEventDocRef = doc(this.firestore, `animals/${animalId}/breedingEvents/${eventId}`);
    return from(updateDoc(breedingEventDocRef, updatedEvent));
  }

  deleteBreedingEvent(animalId: string, eventId: string) {
    const breedingEventDocRef = doc(this.firestore, `animals/${animalId}/breedingEvents/${eventId}`);
    return from(deleteDoc(breedingEventDocRef));
  }

  // ** PregnancyCheck CRUD **
  addPregnancyCheck(animalId: string, eventId: string, pregnancyCheck: PregnancyCheck) {
    const pregnancyChecksCollection = collection(this.firestore, `animals/${animalId}/breedingEvents/${eventId}/pregnancyChecks`);
    return from(addDoc(pregnancyChecksCollection, pregnancyCheck));
  }

  getPregnancyChecksByBreedingEventId(animalId: string, eventId: string): Observable<PregnancyCheck[]> {
    const pregnancyChecksCollection = collection(this.firestore, `animals/${animalId}/breedingEvents/${eventId}/pregnancyChecks`);
    return collectionData(pregnancyChecksCollection, { idField: 'id' }).pipe(
      map((records) => records as PregnancyCheck[])
    );
  }
  
  // Note: Add methods for get, update, and delete PregnancyCheck as needed.

  // ** HormoneTreatment CRUD **
  addHormoneTreatment(animalId: string, hormoneTreatment: HormoneTreatment) {
    const hormoneTreatmentsCollection = collection(this.firestore, `animals/${animalId}/hormoneTreatments`);
    return from(addDoc(hormoneTreatmentsCollection, hormoneTreatment));
  }

  getHormoneTreatmentsByAnimalId(animalId: string): Observable<HormoneTreatment[]> {
    const hormoneTreatmentsCollection = collection(this.firestore, `animals/${animalId}/hormoneTreatments`);
    return collectionData(hormoneTreatmentsCollection, { idField: 'id' }).pipe(
      map((records) => records as HormoneTreatment[])
    );
  }

  // Note: Add methods for get, update, and delete HormoneTreatment as needed.
}