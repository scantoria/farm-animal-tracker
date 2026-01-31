// src/app/core/services/weight-record.service.ts

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
  query,
  orderBy,
  limit,
  Timestamp
} from '@angular/fire/firestore';
import { Observable, from, of, switchMap, map } from 'rxjs';
import { WeightRecord, GROWTH_CONSTANTS } from '../../shared/models/weight-record.model';
import { Animal } from '../../shared/models/animal.model';

export interface AddWeightData {
  animalId: string;
  weight: number;
  weighDate: string;
  notes?: string;
  createdBy: string;
  animalDob: string | Timestamp;  // Need DOB to calculate age
  previousWeight?: WeightRecord;   // Optional - will fetch if not provided
}

export interface WeightCalculations {
  ageInDays: number;
  adgSinceLastWeigh?: number;
  daysSinceLastWeigh?: number;
  cumulativeADG: number;
  daysToSaleWeight: number | null;
  projectedSaleDate: Date | null;
  isSaleReady: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class WeightRecordService {
  constructor(private firestore: Firestore) {}

  /**
   * Add a new weight record with automatic calculations
   * Also updates the animal's currentWeight and lastWeighDate
   */
  addWeightRecord(data: AddWeightData): Observable<{ recordId: string; calculations: WeightCalculations }> {
    // Calculate age in days
    const ageInDays = this.calculateAgeInDays(data.animalDob, data.weighDate);

    // Get birth weight from first record or animal if needed
    return this.getWeightRecordsByAnimalId(data.animalId).pipe(
      switchMap((existingRecords) => {
        const sortedRecords = existingRecords.sort((a, b) => {
          const dateA = this.toDate(a.weighDate);
          const dateB = this.toDate(b.weighDate);
          return dateA.getTime() - dateB.getTime();
        });

        // Get previous weight record (most recent before this date)
        const weighDate = new Date(data.weighDate);
        const previousRecords = sortedRecords.filter(r => this.toDate(r.weighDate) < weighDate);
        const previousRecord = previousRecords.length > 0
          ? previousRecords[previousRecords.length - 1]
          : undefined;

        // Get birth weight (first record or 0)
        const birthWeight = sortedRecords.length > 0 && sortedRecords[0].ageInDays === 0
          ? sortedRecords[0].weight
          : 0;

        // Calculate ADG metrics
        let adgSinceLastWeigh: number | undefined;
        let daysSinceLastWeigh: number | undefined;

        if (previousRecord) {
          daysSinceLastWeigh = this.calculateDaysBetween(previousRecord.weighDate, data.weighDate);
          if (daysSinceLastWeigh > 0) {
            adgSinceLastWeigh = this.calculateADG(previousRecord.weight, data.weight, daysSinceLastWeigh);
          }
        }

        // Calculate cumulative ADG from birth
        let cumulativeADG = 0;
        if (ageInDays > 0 && birthWeight > 0) {
          cumulativeADG = this.calculateADG(birthWeight, data.weight, ageInDays);
        } else if (ageInDays > 0) {
          // If no birth weight, use average from first recorded weight
          const firstRecord = sortedRecords[0];
          if (firstRecord) {
            const totalDays = ageInDays - firstRecord.ageInDays;
            if (totalDays > 0) {
              cumulativeADG = this.calculateADG(firstRecord.weight, data.weight, totalDays);
            }
          }
        }

        // Calculate projections
        const daysToSaleWeight = this.calculateDaysToTarget(
          data.weight,
          cumulativeADG || GROWTH_CONSTANTS.TARGET_ADG,
          GROWTH_CONSTANTS.TARGET_SALE_WEIGHT
        );
        const projectedSaleDate = this.calculateProjectedDate(daysToSaleWeight);
        const isSaleReady = data.weight >= GROWTH_CONSTANTS.SALE_READY_WEIGHT;

        const calculations: WeightCalculations = {
          ageInDays,
          adgSinceLastWeigh,
          daysSinceLastWeigh,
          cumulativeADG,
          daysToSaleWeight,
          projectedSaleDate,
          isSaleReady
        };

        // Create the weight record
        const weightRecord: Omit<WeightRecord, 'id'> = {
          animalId: data.animalId,
          weight: data.weight,
          weighDate: data.weighDate,
          ageInDays,
          adgSinceLastWeigh,
          daysSinceLastWeigh,
          cumulativeADG,
          notes: data.notes,
          createdAt: Timestamp.now(),
          createdBy: data.createdBy,
        };

        const weightRecordsCollection = collection(
          this.firestore,
          `animals/${data.animalId}/weightRecords`
        );

        return from(addDoc(weightRecordsCollection, weightRecord)).pipe(
          switchMap((docRef) => {
            // Update the animal's weight info
            const animalDocRef = doc(this.firestore, `animals/${data.animalId}`);
            const animalUpdate: Partial<Animal> = {
              currentWeight: data.weight,
              lastWeighDate: data.weighDate,
              averageADG: cumulativeADG,
              updatedAt: Timestamp.now(),
            };

            // Update growth status if sale ready
            if (isSaleReady) {
              animalUpdate.growthStatus = 'ready-for-sale';
            }

            return from(updateDoc(animalDocRef, animalUpdate)).pipe(
              map(() => ({ recordId: docRef.id, calculations }))
            );
          })
        );
      })
    );
  }

  /**
   * Get all weight records for an animal, sorted by date
   */
  getWeightRecordsByAnimalId(animalId: string): Observable<WeightRecord[]> {
    const weightRecordsCollection = collection(
      this.firestore,
      `animals/${animalId}/weightRecords`
    );
    const q = query(weightRecordsCollection, orderBy('weighDate', 'asc'));
    return collectionData(q, { idField: 'id' }).pipe(
      map((records) => records as WeightRecord[])
    );
  }

  /**
   * Get the most recent weight record for an animal
   */
  getLatestWeightRecord(animalId: string): Observable<WeightRecord | undefined> {
    const weightRecordsCollection = collection(
      this.firestore,
      `animals/${animalId}/weightRecords`
    );
    const q = query(weightRecordsCollection, orderBy('weighDate', 'desc'), limit(1));
    return collectionData(q, { idField: 'id' }).pipe(
      map((records) => records.length > 0 ? records[0] as WeightRecord : undefined)
    );
  }

  /**
   * Get a single weight record
   */
  getWeightRecord(animalId: string, recordId: string): Observable<WeightRecord> {
    const recordDocRef = doc(
      this.firestore,
      `animals/${animalId}/weightRecords/${recordId}`
    );
    return from(
      getDoc(recordDocRef).then((docSnap) => {
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() } as WeightRecord;
        } else {
          throw new Error('Weight record not found');
        }
      })
    );
  }

  /**
   * Update a weight record
   */
  updateWeightRecord(
    animalId: string,
    recordId: string,
    updates: Partial<Pick<WeightRecord, 'weight' | 'weighDate' | 'notes'>>
  ): Observable<void> {
    const recordDocRef = doc(
      this.firestore,
      `animals/${animalId}/weightRecords/${recordId}`
    );
    return from(updateDoc(recordDocRef, updates));
  }

  /**
   * Delete a weight record
   */
  deleteWeightRecord(animalId: string, recordId: string): Observable<void> {
    const recordDocRef = doc(
      this.firestore,
      `animals/${animalId}/weightRecords/${recordId}`
    );
    return from(deleteDoc(recordDocRef));
  }

  // ==================== Calculation Helpers ====================

  /**
   * Calculate age in days from DOB to a given date
   */
  calculateAgeInDays(dob: string | Timestamp, targetDate: string | Timestamp): number {
    const dobDate = this.toDate(dob);
    const target = this.toDate(targetDate);
    const diffTime = target.getTime() - dobDate.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Calculate days between two dates
   */
  calculateDaysBetween(startDate: string | Timestamp, endDate: string | Timestamp): number {
    const start = this.toDate(startDate);
    const end = this.toDate(endDate);
    const diffTime = end.getTime() - start.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Calculate Average Daily Gain
   */
  calculateADG(startWeight: number, endWeight: number, days: number): number {
    if (days <= 0) return 0;
    return Math.round(((endWeight - startWeight) / days) * 100) / 100;
  }

  /**
   * Calculate days to reach target weight based on current ADG
   */
  calculateDaysToTarget(currentWeight: number, adg: number, targetWeight: number): number | null {
    if (currentWeight >= targetWeight) return 0;
    if (adg <= 0) return null;
    return Math.ceil((targetWeight - currentWeight) / adg);
  }

  /**
   * Calculate projected date based on days from today
   */
  calculateProjectedDate(daysToTarget: number | null): Date | null {
    if (daysToTarget === null || daysToTarget <= 0) return null;
    const projected = new Date();
    projected.setDate(projected.getDate() + daysToTarget);
    return projected;
  }

  /**
   * Convert Timestamp or string to Date
   */
  private toDate(value: string | Timestamp): Date {
    if (value instanceof Timestamp) {
      return value.toDate();
    }
    return new Date(value);
  }
}
