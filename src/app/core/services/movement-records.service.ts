// src/app/core/services/movement-records.service.ts

import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  getDocs,
  serverTimestamp,
  Timestamp,
  doc,
  getDoc,
  updateDoc
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable, from, map, switchMap, of, forkJoin } from 'rxjs';
import { FarmMovement, MovementReason } from '../../shared/models/farm-movement.model';

export interface MovementFilters {
  farmId?: string;
  animalId?: string;
  startDate?: string;
  endDate?: string;
  reason?: MovementReason;
}

export interface FarmInventorySummary {
  farmId: string;
  farmName: string;
  totalAnimals: number;
  animalsBySpecies: { [species: string]: number };
  lastMovementDate?: string;
}

@Injectable({
  providedIn: 'root'
})
export class MovementRecordsService {
  private movementsCollection = 'farmMovements';

  constructor(
    private firestore: Firestore,
    private auth: Auth
  ) {}

  private getCurrentTenantId(): string {
    return this.auth.currentUser?.uid || 'default-tenant';
  }

  /**
   * Get all movement records for the tenant
   */
  getAllMovements(filters?: MovementFilters): Observable<FarmMovement[]> {
    const tenantId = this.getCurrentTenantId();
    const movementsRef = collection(this.firestore, this.movementsCollection);

    // Build query - note: Firestore requires indexes for multiple where clauses
    let q = query(
      movementsRef,
      where('tenantId', '==', tenantId),
      orderBy('movementDate', 'desc')
    );

    return from(getDocs(q)).pipe(
      map(snapshot => {
        let movements = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as FarmMovement));

        // Apply client-side filters (to avoid complex index requirements)
        if (filters) {
          if (filters.farmId) {
            movements = movements.filter(m =>
              m.fromFarmId === filters.farmId || m.toFarmId === filters.farmId
            );
          }
          if (filters.animalId) {
            movements = movements.filter(m => m.animalId === filters.animalId);
          }
          if (filters.reason) {
            movements = movements.filter(m => m.reason === filters.reason);
          }
          if (filters.startDate) {
            movements = movements.filter(m => {
              const moveDate = typeof m.movementDate === 'string'
                ? m.movementDate
                : m.movementDate.toDate().toISOString().substring(0, 10);
              return moveDate >= filters.startDate!;
            });
          }
          if (filters.endDate) {
            movements = movements.filter(m => {
              const moveDate = typeof m.movementDate === 'string'
                ? m.movementDate
                : m.movementDate.toDate().toISOString().substring(0, 10);
              return moveDate <= filters.endDate!;
            });
          }
        }

        return movements;
      })
    );
  }

  /**
   * Add a historical movement record (without actually moving the animal)
   * Use this for recording past movements when importing data
   */
  addHistoricalMovement(movement: Omit<FarmMovement, 'id' | 'tenantId' | 'createdAt'>): Observable<string> {
    const tenantId = this.getCurrentTenantId();
    const movementsRef = collection(this.firestore, this.movementsCollection);

    const movementData = {
      ...movement,
      tenantId,
      createdAt: serverTimestamp()
    };

    return from(addDoc(movementsRef, movementData)).pipe(
      map(docRef => docRef.id)
    );
  }

  /**
   * Move an animal to a farm and create movement record
   * This updates the animal's current farm AND creates a movement record
   */
  moveAnimal(
    animalId: string,
    fromFarmId: string | null,
    toFarmId: string,
    movementDate: string,
    reason?: MovementReason,
    notes?: string,
    animalName?: string,
    fromFarmName?: string,
    toFarmName?: string
  ): Observable<void> {
    const tenantId = this.getCurrentTenantId();
    const userId = this.auth.currentUser?.uid || 'unknown';

    // Update the animal's current farm
    const animalRef = doc(this.firestore, `animals/${animalId}`);
    const farmRef = doc(this.firestore, `farms/${toFarmId}`);

    const animalUpdate = from(updateDoc(animalRef, {
      currentFarmId: toFarmId,
      currentFarmRef: farmRef,
      updatedAt: serverTimestamp()
    }));

    // Create movement record
    const movementsRef = collection(this.firestore, this.movementsCollection);
    const movementData: Omit<FarmMovement, 'id'> = {
      tenantId,
      animalId,
      animalName,
      fromFarmId,
      fromFarmName,
      toFarmId,
      toFarmName,
      movementDate,
      reason,
      movedBy: userId,
      notes,
      createdAt: Timestamp.now()
    };

    const movementCreate = from(addDoc(movementsRef, movementData));

    // Execute both
    return forkJoin([animalUpdate, movementCreate]).pipe(
      map(() => undefined)
    );
  }

  /**
   * Get movement history for a specific animal
   */
  getAnimalMovements(animalId: string): Observable<FarmMovement[]> {
    const movementsRef = collection(this.firestore, this.movementsCollection);
    const q = query(
      movementsRef,
      where('animalId', '==', animalId),
      orderBy('movementDate', 'desc')
    );

    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as FarmMovement)))
    );
  }

  /**
   * Get movements for a specific farm (incoming or outgoing)
   */
  getFarmMovements(farmId: string): Observable<FarmMovement[]> {
    return this.getAllMovements({ farmId });
  }

  /**
   * Get farm inventory summary - count of animals per farm
   */
  getFarmInventorySummary(): Observable<FarmInventorySummary[]> {
    const tenantId = this.getCurrentTenantId();

    // Get all farms
    const farmsRef = collection(this.firestore, 'farms');
    const farmsQuery = query(
      farmsRef,
      where('tenantId', '==', tenantId),
      where('isActive', '==', true)
    );

    return from(getDocs(farmsQuery)).pipe(
      switchMap(farmSnapshot => {
        const farms = farmSnapshot.docs.map(doc => ({
          id: doc.id,
          name: doc.data()['name'] as string
        }));

        if (farms.length === 0) {
          return of([]);
        }

        // Get animal counts for each farm
        const animalsRef = collection(this.firestore, 'animals');
        const summaryPromises = farms.map(async farm => {
          const animalsQuery = query(
            animalsRef,
            where('tenantId', '==', tenantId),
            where('currentFarmId', '==', farm.id),
            where('status', '==', 'active')
          );

          const animalsSnapshot = await getDocs(animalsQuery);
          const animalsBySpecies: { [species: string]: number } = {};

          animalsSnapshot.docs.forEach(doc => {
            const species = doc.data()['species'] as string || 'Unknown';
            animalsBySpecies[species] = (animalsBySpecies[species] || 0) + 1;
          });

          return {
            farmId: farm.id,
            farmName: farm.name,
            totalAnimals: animalsSnapshot.size,
            animalsBySpecies
          } as FarmInventorySummary;
        });

        return from(Promise.all(summaryPromises));
      })
    );
  }

  /**
   * Get detailed list of animals on a specific farm
   */
  getAnimalsOnFarm(farmId: string): Observable<any[]> {
    const tenantId = this.getCurrentTenantId();
    const animalsRef = collection(this.firestore, 'animals');

    const q = query(
      animalsRef,
      where('tenantId', '==', tenantId),
      where('currentFarmId', '==', farmId),
      where('status', '==', 'active')
    );

    return from(getDocs(q)).pipe(
      map(snapshot => snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })))
    );
  }
}
