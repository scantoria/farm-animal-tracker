// src/app/core/services/birth-event.service.ts

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
  arrayUnion,
  Timestamp
} from '@angular/fire/firestore';
import { Observable, from, forkJoin, switchMap, map } from 'rxjs';
import { BirthEvent } from '../../shared/models/birth-event.model';
import { Animal } from '../../shared/models/animal.model';
import { WeightRecord } from '../../shared/models/weight-record.model';

export interface RecordBirthData {
  tenantId: string;
  damId: string;
  birthDate: string;
  sex: 'Bull' | 'Heifer';
  calfTag: string;           // Identifier for the new calf
  calfName?: string;         // Optional name (defaults to tag)
  birthWeight?: number;      // Optional birth weight in lbs
  sireId?: string;           // Optional sire ID
  sireType?: 'animal' | 'external';
  calvingEase?: 'Easy' | 'Assisted' | 'Hard Pull' | 'Caesarean';
  enrollInGrowthTracking?: boolean;  // Default true for bulls
  notes?: string;
  createdBy: string;
  damBreed?: string;         // For calf's breed
  damSpecies?: string;       // For calf's species
  currentFarmId?: string;    // Optional farm assignment
  currentFarmName?: string;
}

@Injectable({
  providedIn: 'root',
})
export class BirthEventService {
  constructor(private firestore: Firestore) {}

  /**
   * Remove undefined values from an object (Firestore doesn't accept undefined)
   */
  private removeUndefined<T extends object>(obj: T): Partial<T> {
    return Object.fromEntries(
      Object.entries(obj).filter(([_, value]) => value !== undefined)
    ) as Partial<T>;
  }

  /**
   * Records a birth event by:
   * 1. Creating a new Animal record for the calf
   * 2. Creating the BirthEvent record under the dam
   * 3. Updating the dam's reproductive status, offspring list, etc.
   * 4. If birth weight provided, creating an initial WeightRecord
   */
  recordBirth(data: RecordBirthData): Observable<{ calfId: string; birthEventId: string }> {
    const animalsCollection = collection(this.firestore, 'animals');

    // Step 1: Create the calf animal record (remove undefined values)
    const calfAnimal = this.removeUndefined({
      tenantId: data.tenantId,
      name: data.calfName || data.calfTag,
      identifier: data.calfTag,
      species: data.damSpecies || 'Cattle',
      breed: data.damBreed || 'Unknown',
      dob: data.birthDate,
      sex: data.sex === 'Bull' ? 'male' : 'female',
      status: 'active',
      damId: data.damId,
      sireId: data.sireId || undefined,
      reproductiveStatus: data.sex === 'Bull' ? 'intact' : 'open',
      birthWeight: data.birthWeight,
      currentWeight: data.birthWeight,
      enrolledInGrowthTracking: data.enrollInGrowthTracking ?? (data.sex === 'Bull'),
      growthStatus: (data.enrollInGrowthTracking ?? (data.sex === 'Bull')) ? 'active' : undefined,
      currentFarmId: data.currentFarmId,
      currentFarmName: data.currentFarmName,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });

    // Create the calf first
    return from(addDoc(animalsCollection, calfAnimal)).pipe(
      switchMap((calfDocRef) => {
        const calfId = calfDocRef.id;

        // Step 2: Create the BirthEvent record (remove undefined values)
        const birthEvent = this.removeUndefined({
          tenantId: data.tenantId,
          damId: data.damId,
          calfId: calfId,
          sireId: data.sireId || undefined,
          sireType: data.sireType,
          birthDate: data.birthDate,
          birthWeight: data.birthWeight,
          sex: data.sex,
          calvingEase: data.calvingEase,
          notes: data.notes,
          createdAt: Timestamp.now(),
          createdBy: data.createdBy,
        });

        const birthEventsCollection = collection(
          this.firestore,
          `animals/${data.damId}/birthEvents`
        );

        // Step 3: Update the dam
        const damDocRef = doc(this.firestore, `animals/${data.damId}`);
        const damUpdate = {
          reproductiveStatus: 'open',
          lactationStatus: true,
          lastCalvingDate: data.birthDate,
          offspringIds: arrayUnion(calfId),
          updatedAt: Timestamp.now(),
        };

        // Execute birth event creation and dam update in parallel
        const createBirthEvent$ = from(addDoc(birthEventsCollection, birthEvent));
        const updateDam$ = from(updateDoc(damDocRef, damUpdate));

        return forkJoin([createBirthEvent$, updateDam$]).pipe(
          switchMap(([birthEventDocRef]) => {
            const birthEventId = birthEventDocRef.id;

            // Step 4: If birth weight provided, create initial weight record
            if (data.birthWeight) {
              const weightRecord: Omit<WeightRecord, 'id'> = {
                animalId: calfId,
                weight: data.birthWeight,
                weighDate: data.birthDate,
                ageInDays: 0,
                cumulativeADG: 0,
                notes: 'Birth weight',
                createdAt: Timestamp.now(),
                createdBy: data.createdBy,
              };

              const weightRecordsCollection = collection(
                this.firestore,
                `animals/${calfId}/weightRecords`
              );

              return from(addDoc(weightRecordsCollection, weightRecord)).pipe(
                map(() => ({ calfId, birthEventId }))
              );
            }

            return from(Promise.resolve({ calfId, birthEventId }));
          })
        );
      })
    );
  }

  /**
   * Get all birth events for a dam
   */
  getBirthEventsByDamId(damId: string): Observable<BirthEvent[]> {
    const birthEventsCollection = collection(
      this.firestore,
      `animals/${damId}/birthEvents`
    );
    return collectionData(birthEventsCollection, { idField: 'id' }).pipe(
      map((records) => records as BirthEvent[])
    );
  }

  /**
   * Get a single birth event
   */
  getBirthEvent(damId: string, eventId: string): Observable<BirthEvent> {
    const eventDocRef = doc(
      this.firestore,
      `animals/${damId}/birthEvents/${eventId}`
    );
    return from(
      getDoc(eventDocRef).then((docSnap) => {
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() } as BirthEvent;
        } else {
          throw new Error('Birth event not found');
        }
      })
    );
  }

  /**
   * Update a birth event (limited fields - cannot change calf or dam)
   */
  updateBirthEvent(
    damId: string,
    eventId: string,
    updates: Partial<Pick<BirthEvent, 'birthDate' | 'birthWeight' | 'calvingEase' | 'notes'>>
  ): Observable<void> {
    const eventDocRef = doc(
      this.firestore,
      `animals/${damId}/birthEvents/${eventId}`
    );
    const updateData = {
      ...updates,
      updatedAt: Timestamp.now()
    };
    return from(updateDoc(eventDocRef, updateData));
  }

  /**
   * Delete a birth event
   * Note: This does NOT delete the calf animal - that must be handled separately
   */
  deleteBirthEvent(damId: string, eventId: string): Observable<void> {
    const eventDocRef = doc(
      this.firestore,
      `animals/${damId}/birthEvents/${eventId}`
    );
    return from(deleteDoc(eventDocRef));
  }
}
