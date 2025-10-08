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
  DocumentReference
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
  
// ** PregnancyCheck CRUD **
// ... (Existing add and list methods)

// New method to get a single PregnancyCheck
getPregnancyCheck(animalId: string, eventId: string, checkId: string): Observable<PregnancyCheck> {
    const checkDocRef = doc(this.firestore, `animals/${animalId}/breedingEvents/${eventId}/pregnancyChecks/${checkId}`);
    return from(getDoc(checkDocRef)).pipe(
      map((docSnap) => {
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() } as PregnancyCheck;
        } else {
          throw new Error('Pregnancy check not found');
        }
      })
    );
  }

// New method to update a PregnancyCheck
updatePregnancyCheck(animalId: string, eventId: string, checkId: string, updatedCheck: Partial<PregnancyCheck>) {
  const checkDocRef = doc(this.firestore, `animals/${animalId}/breedingEvents/${eventId}/pregnancyChecks/${checkId}`);
  return from(updateDoc(checkDocRef, updatedCheck));
}

// New method to delete a PregnancyCheck
deletePregnancyCheck(animalId: string, eventId: string, checkId: string) {
  const checkDocRef = doc(this.firestore, `animals/${animalId}/breedingEvents/${eventId}/pregnancyChecks/${checkId}`);
  return from(deleteDoc(checkDocRef));
}

// ... (Existing HormoneTreatment methods)
  
  // ** HormoneTreatment CRUD **
  //addHormoneTreatment(animalId: string, hormoneTreatment: HormoneTreatment) {
  //  const hormoneTreatmentsCollection = collection(this.firestore, `animals/${animalId}/hormoneTreatments`);
  //  return from(addDoc(hormoneTreatmentsCollection, hormoneTreatment));
  //}

  getHormoneTreatmentsByAnimalId(animalId: string): Observable<HormoneTreatment[]> {
    const hormoneTreatmentsCollection = collection(this.firestore, `animals/${animalId}/hormoneTreatments`);
    return collectionData(hormoneTreatmentsCollection, { idField: 'id' }).pipe(
      map((records) => records as HormoneTreatment[])
    );
  }

  // ** HormoneTreatment CRUD **

addHormoneTreatment(animalId: string, eventId: string, hormoneTreatment: HormoneTreatment) {
  const hormoneTreatmentsCollection = collection(
    this.firestore, 
    `animals/${animalId}/breedingEvents/${eventId}/hormoneTreatments`
  );
  return from(addDoc(hormoneTreatmentsCollection, hormoneTreatment));
}

getHormoneTreatmentsByBreedingEventId(animalId: string, eventId: string): Observable<HormoneTreatment[]> {
    const hormoneTreatmentsCollection = collection(
        this.firestore, 
        `animals/${animalId}/breedingEvents/${eventId}/hormoneTreatments`
    );
    return collectionData(hormoneTreatmentsCollection, { idField: 'id' }).pipe(
      map((records) => records as HormoneTreatment[])
    );
}

getHormoneTreatment(animalId: string, eventId: string, treatmentId: string): Observable<HormoneTreatment | undefined> {
  const treatmentDocRef = doc(this.firestore, `animals/${animalId}/breedingEvents/${eventId}/hormoneTreatments/${treatmentId}`);
  return from(getDoc(treatmentDocRef)).pipe(
    map(docSnap => {
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as HormoneTreatment;
      } else {
        return undefined;
      }
    })
  );
}

// New method to UPDATE a HormoneTreatment
updateHormoneTreatment(animalId: string, eventId: string, treatmentId: string, updatedTreatment: Partial<HormoneTreatment>) {
  const treatmentDocRef = doc(this.firestore, `animals/${animalId}/breedingEvents/${eventId}/hormoneTreatments/${treatmentId}`);
  return from(updateDoc(treatmentDocRef, updatedTreatment));
}

// New method to DELETE a HormoneTreatment
deleteHormoneTreatment(animalId: string, eventId: string, treatmentId: string) {
  const treatmentDocRef = doc(this.firestore, `animals/${animalId}/breedingEvents/${eventId}/hormoneTreatments/${treatmentId}`);
  return from(deleteDoc(treatmentDocRef));
}
  // Note: Add methods for get, update, and delete HormoneTreatment as needed.
}