// src/app/core/services/growth-tracking.service.ts

import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  updateDoc,
  query,
  where,
  Timestamp
} from '@angular/fire/firestore';
import { Observable, from, forkJoin, of, map, switchMap } from 'rxjs';
import { Animal, GrowthStatus } from '../../shared/models/animal.model';
import { WeightRecord, GROWTH_CONSTANTS } from '../../shared/models/weight-record.model';
import { WeightRecordService } from './weight-record.service';

export interface CalfGrowthSummary {
  animal: Animal;
  latestWeight?: WeightRecord;
  birthWeight?: number;
  daysOld: number;
  averageADG: number;
  daysToSaleWeight: number | null;
  projectedSaleDate: Date | null;
  isSaleReady: boolean;
  totalWeightRecords: number;
}

export interface GrowthDashboardFilters {
  status?: GrowthStatus | 'all';
  sex?: 'male' | 'female' | 'all';
  sortBy?: 'age' | 'weight' | 'adg' | 'saleReadiness';
  sortDirection?: 'asc' | 'desc';
}

export interface SaleData {
  saleDate: string;
  saleWeight?: number;
  salePrice?: number;
}

@Injectable({
  providedIn: 'root',
})
export class GrowthTrackingService {
  constructor(
    private firestore: Firestore,
    private weightRecordService: WeightRecordService
  ) {}

  /**
   * Get all calves enrolled in growth tracking
   */
  getCalvesEnrolledInTracking(filters?: GrowthDashboardFilters): Observable<Animal[]> {
    const animalsCollection = collection(this.firestore, 'animals');
    let q = query(animalsCollection, where('enrolledInGrowthTracking', '==', true));

    // Add status filter if specified
    if (filters?.status && filters.status !== 'all') {
      q = query(q, where('growthStatus', '==', filters.status));
    }

    // Add sex filter if specified
    if (filters?.sex && filters.sex !== 'all') {
      q = query(q, where('sex', '==', filters.sex));
    }

    return collectionData(q, { idField: 'id' }).pipe(
      map((animals) => {
        let result = animals as Animal[];

        // Sort if specified
        if (filters?.sortBy) {
          result = this.sortAnimals(result, filters.sortBy, filters.sortDirection || 'desc');
        }

        return result;
      })
    );
  }

  /**
   * Get comprehensive growth summary for a single calf
   */
  getCalfGrowthSummary(animalId: string): Observable<CalfGrowthSummary | undefined> {
    const animalDocRef = doc(this.firestore, `animals/${animalId}`);

    return from(import('@angular/fire/firestore').then(m => m.getDoc(animalDocRef))).pipe(
      switchMap((docSnap) => {
        if (!docSnap.exists()) {
          return of(undefined);
        }

        const animal = { id: docSnap.id, ...docSnap.data() } as Animal;

        // Get weight records for this animal
        return this.weightRecordService.getWeightRecordsByAnimalId(animalId).pipe(
          map((weightRecords) => {
            const sortedRecords = weightRecords.sort((a, b) => {
              const dateA = this.toDate(a.weighDate);
              const dateB = this.toDate(b.weighDate);
              return dateB.getTime() - dateA.getTime();
            });

            const latestWeight = sortedRecords[0];
            const birthWeightRecord = weightRecords.find(r => r.ageInDays === 0);
            const birthWeight = birthWeightRecord?.weight || animal.birthWeight;

            // Calculate days old
            const daysOld = this.calculateDaysOld(animal.dob);

            // Get ADG (from latest record or calculate)
            const averageADG = latestWeight?.cumulativeADG || animal.averageADG || 0;

            // Calculate projections
            const currentWeight = latestWeight?.weight || animal.currentWeight || birthWeight || 0;
            const daysToSaleWeight = this.calculateDaysToTarget(
              currentWeight,
              averageADG || GROWTH_CONSTANTS.TARGET_ADG
            );
            const projectedSaleDate = this.calculateProjectedDate(daysToSaleWeight);
            const isSaleReady = currentWeight >= GROWTH_CONSTANTS.SALE_READY_WEIGHT;

            return {
              animal,
              latestWeight,
              birthWeight,
              daysOld,
              averageADG,
              daysToSaleWeight,
              projectedSaleDate,
              isSaleReady,
              totalWeightRecords: weightRecords.length
            };
          })
        );
      })
    );
  }

  /**
   * Get growth summaries for all enrolled calves
   */
  getAllCalfGrowthSummaries(filters?: GrowthDashboardFilters): Observable<CalfGrowthSummary[]> {
    return this.getCalvesEnrolledInTracking(filters).pipe(
      switchMap((animals) => {
        if (animals.length === 0) {
          return of([]);
        }

        // Get summaries for each animal
        const summaries$ = animals.map(animal =>
          this.getCalfGrowthSummary(animal.id!)
        );

        return forkJoin(summaries$).pipe(
          map((summaries) => {
            // Filter out undefined and apply sorting
            let result = summaries.filter((s): s is CalfGrowthSummary => s !== undefined);

            if (filters?.sortBy) {
              result = this.sortSummaries(result, filters.sortBy, filters.sortDirection || 'desc');
            }

            return result;
          })
        );
      })
    );
  }

  /**
   * Mark a calf as sold
   */
  markCalfAsSold(animalId: string, saleData: SaleData): Observable<void> {
    const animalDocRef = doc(this.firestore, `animals/${animalId}`);

    const updates: Partial<Animal> = {
      growthStatus: 'sold',
      status: 'sold',
      saleDate: saleData.saleDate,
      saleWeight: saleData.saleWeight,
      salePrice: saleData.salePrice,
      updatedAt: Timestamp.now(),
    };

    return from(updateDoc(animalDocRef, updates));
  }

  /**
   * Enroll or unenroll an animal in growth tracking
   */
  setGrowthTrackingEnrollment(animalId: string, enrolled: boolean): Observable<void> {
    const animalDocRef = doc(this.firestore, `animals/${animalId}`);

    const updates: Partial<Animal> = {
      enrolledInGrowthTracking: enrolled,
      growthStatus: enrolled ? 'active' : undefined,
      updatedAt: Timestamp.now(),
    };

    return from(updateDoc(animalDocRef, updates));
  }

  /**
   * Get dashboard statistics
   */
  getDashboardStats(): Observable<{
    totalActive: number;
    totalReadyForSale: number;
    totalSold: number;
    averageADG: number;
  }> {
    return this.getAllCalfGrowthSummaries().pipe(
      map((summaries) => {
        const active = summaries.filter(s => s.animal.growthStatus === 'active');
        const readyForSale = summaries.filter(s => s.isSaleReady && s.animal.growthStatus !== 'sold');
        const sold = summaries.filter(s => s.animal.growthStatus === 'sold');

        const totalADG = active.reduce((sum, s) => sum + (s.averageADG || 0), 0);
        const averageADG = active.length > 0 ? totalADG / active.length : 0;

        return {
          totalActive: active.length,
          totalReadyForSale: readyForSale.length,
          totalSold: sold.length,
          averageADG: Math.round(averageADG * 100) / 100
        };
      })
    );
  }

  // ==================== Helper Methods ====================

  private calculateDaysOld(dob: string | Timestamp): number {
    const dobDate = this.toDate(dob);
    const today = new Date();
    const diffTime = today.getTime() - dobDate.getTime();
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  private calculateDaysToTarget(currentWeight: number, adg: number): number | null {
    if (currentWeight >= GROWTH_CONSTANTS.TARGET_SALE_WEIGHT) return 0;
    if (adg <= 0) return null;
    return Math.ceil((GROWTH_CONSTANTS.TARGET_SALE_WEIGHT - currentWeight) / adg);
  }

  private calculateProjectedDate(daysToTarget: number | null): Date | null {
    if (daysToTarget === null || daysToTarget <= 0) return null;
    const projected = new Date();
    projected.setDate(projected.getDate() + daysToTarget);
    return projected;
  }

  private toDate(value: string | Timestamp): Date {
    if (value instanceof Timestamp) {
      return value.toDate();
    }
    return new Date(value);
  }

  private sortAnimals(animals: Animal[], sortBy: string, direction: 'asc' | 'desc'): Animal[] {
    const multiplier = direction === 'asc' ? 1 : -1;

    return [...animals].sort((a, b) => {
      switch (sortBy) {
        case 'age':
          const ageA = this.calculateDaysOld(a.dob);
          const ageB = this.calculateDaysOld(b.dob);
          return (ageB - ageA) * multiplier;
        case 'weight':
          return ((b.currentWeight || 0) - (a.currentWeight || 0)) * multiplier;
        case 'adg':
          return ((b.averageADG || 0) - (a.averageADG || 0)) * multiplier;
        default:
          return 0;
      }
    });
  }

  private sortSummaries(
    summaries: CalfGrowthSummary[],
    sortBy: string,
    direction: 'asc' | 'desc'
  ): CalfGrowthSummary[] {
    const multiplier = direction === 'asc' ? 1 : -1;

    return [...summaries].sort((a, b) => {
      switch (sortBy) {
        case 'age':
          return (b.daysOld - a.daysOld) * multiplier;
        case 'weight':
          const weightA = a.latestWeight?.weight || a.animal.currentWeight || 0;
          const weightB = b.latestWeight?.weight || b.animal.currentWeight || 0;
          return (weightB - weightA) * multiplier;
        case 'adg':
          return (b.averageADG - a.averageADG) * multiplier;
        case 'saleReadiness':
          // Sort by days to sale weight (fewer days = more ready)
          const daysA = a.daysToSaleWeight ?? Infinity;
          const daysB = b.daysToSaleWeight ?? Infinity;
          return (daysA - daysB) * multiplier;
        default:
          return 0;
      }
    });
  }
}
