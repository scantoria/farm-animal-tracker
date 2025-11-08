// src/app/core/services/pregnancy-data.service.ts

import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  DocumentReference
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable, from, map } from 'rxjs';
import { BreedingEvent } from '../../shared/models/breeding.model';
import { PregnancyCheck } from '../../shared/models/pregnancy-check.model';
import { calculateDueDate, formatDueDate } from '../../shared/utils/gestation-period.util';

export interface PregnancyInfo {
  isPregnant: boolean;
  breedingDate?: Date;
  dueDate?: Date;
  dueDateFormatted?: string;
  lastCheckDate?: Date;
  confirmationMethod?: string;
}

@Injectable({
  providedIn: 'root'
})
export class PregnancyDataService {

  constructor(
    private firestore: Firestore,
    private auth: Auth
  ) { }

  /**
   * Get current tenant ID from authenticated user
   */
  private getCurrentTenantId(): string {
    const user = this.auth.currentUser;
    return user?.uid || 'default-tenant';
  }

  /**
   * Get pregnancy information for a specific animal
   * @param animalId - The animal ID
   * @param species - The animal species for gestation calculation
   */
  getPregnancyInfo(animalId: string, species: string): Observable<PregnancyInfo | null> {
    const tenantId = this.getCurrentTenantId();
    const breedingEventsRef = collection(this.firestore, 'breedingEvents');

    // Query for breeding events for this animal, ordered by date desc
    const breedingQuery = query(
      breedingEventsRef,
      where('animalId', '==', animalId),
      where('tenantId', '==', tenantId),
      orderBy('date', 'desc'),
      limit(5) // Get last 5 breeding events
    );

    return from(getDocs(breedingQuery)).pipe(
      map(async snapshot => {
        if (snapshot.empty) {
          return null;
        }

        // Check each breeding event for pregnancy confirmation
        for (const breedingDoc of snapshot.docs) {
          const breedingEvent = { id: breedingDoc.id, ...breedingDoc.data() } as BreedingEvent;
          const breedingEventRef = breedingDoc.ref;

          // Get pregnancy checks for this breeding event
          const pregnancyInfo = await this.getLatestPregnancyCheck(breedingEventRef);

          if (pregnancyInfo && pregnancyInfo.isPregnant) {
            // Calculate due date
            const breedingDate = typeof breedingEvent.date === 'string'
              ? new Date(breedingEvent.date)
              : breedingEvent.date.toDate ? breedingEvent.date.toDate() : new Date();

            const dueDate = calculateDueDate(breedingDate, species);

            return {
              isPregnant: true,
              breedingDate,
              dueDate: dueDate || undefined,
              dueDateFormatted: formatDueDate(dueDate),
              lastCheckDate: pregnancyInfo.lastCheckDate,
              confirmationMethod: pregnancyInfo.confirmationMethod
            };
          }
        }

        return null;
      }),
      map(promise => from(promise)),
      // Flatten the nested observable
      map((innerObs: any) => {
        let result: PregnancyInfo | null = null;
        innerObs.subscribe((val: PregnancyInfo | null) => result = val);
        return result;
      })
    );
  }

  /**
   * Get the latest pregnancy check for a breeding event
   */
  private async getLatestPregnancyCheck(breedingEventRef: DocumentReference): Promise<{ isPregnant: boolean; lastCheckDate?: Date; confirmationMethod?: string; } | null> {
    const pregnancyChecksRef = collection(this.firestore, 'pregnancyChecks');

    const checkQuery = query(
      pregnancyChecksRef,
      where('breedingEventRef', '==', breedingEventRef),
      orderBy('checkDate', 'desc'),
      limit(1)
    );

    const checkSnapshot = await getDocs(checkQuery);

    if (checkSnapshot.empty) {
      return null;
    }

    const latestCheck = checkSnapshot.docs[0].data() as PregnancyCheck;
    const isPregnant = latestCheck.result?.toLowerCase() === 'pregnant';

    const checkDate = typeof latestCheck.checkDate === 'string'
      ? new Date(latestCheck.checkDate)
      : latestCheck.checkDate.toDate ? latestCheck.checkDate.toDate() : new Date();

    return {
      isPregnant,
      lastCheckDate: checkDate,
      confirmationMethod: latestCheck.confirmationMethod
    };
  }
}
