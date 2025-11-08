// src/app/core/services/farm.service.ts

import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  doc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  getDocs,
  getDoc,
  serverTimestamp,
  DocumentReference,
  orderBy,
  Timestamp
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable, from, map, switchMap, of, combineLatest } from 'rxjs';
import { Farm } from '../../shared/models/farm.model';
import { FarmMovement } from '../../shared/models/farm-movement.model';

@Injectable({
  providedIn: 'root'
})
export class FarmService {

  constructor(
    private firestore: Firestore,
    private auth: Auth
  ) { }

  // Get current tenant ID from authenticated user
  private getCurrentTenantId(): string {
    const user = this.auth.currentUser;
    // In production, you'd get this from user's custom claims or profile
    // For now, using a placeholder
    return user?.uid || 'default-tenant';
  }

  // ====================
  // FARM CRUD OPERATIONS
  // ====================

  /**
   * Get all farms for the current tenant
   */
  getAllFarms(): Observable<Farm[]> {
    const tenantId = this.getCurrentTenantId();
    const farmsRef = collection(this.firestore, 'farms');
    const q = query(
      farmsRef,
      where('tenantId', '==', tenantId),
      where('isActive', '==', true)
    );

    return from(getDocs(q)).pipe(
      map(snapshot => {
        const farms = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Farm));
        // Sort by name in memory
        return farms.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      }),
      switchMap(farms => {
        // Get animal count for each farm
        return this.attachAnimalCounts(farms);
      })
    );
  }

  /**
   * Get a single farm by ID
   */
  getFarmById(farmId: string): Observable<Farm | null> {
    const farmRef = doc(this.firestore, `farms/${farmId}`);
    return from(getDoc(farmRef)).pipe(
      map(docSnap => {
        if (docSnap.exists()) {
          return {
            id: docSnap.id,
            ...docSnap.data()
          } as Farm;
        }
        return null;
      })
    );
  }

  /**
   * Create a new farm
   */
  createFarm(farm: Partial<Farm>): Observable<string> {
    const tenantId = this.getCurrentTenantId();
    const farmsRef = collection(this.firestore, 'farms');
    
    const farmData = {
      ...farm,
      tenantId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    return from(addDoc(farmsRef, farmData)).pipe(
      map(docRef => docRef.id)
    );
  }

  /**
   * Update an existing farm
   */
  updateFarm(farmId: string, updates: Partial<Farm>): Observable<void> {
    const farmRef = doc(this.firestore, `farms/${farmId}`);
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp()
    };

    return from(updateDoc(farmRef, updateData));
  }

  /**
   * Delete (soft delete) a farm
   */
  deleteFarm(farmId: string): Observable<void> {
    const farmRef = doc(this.firestore, `farms/${farmId}`);
    return from(updateDoc(farmRef, {
      isActive: false,
      updatedAt: serverTimestamp()
    }));
  }

  /**
   * Permanently delete a farm (use with caution)
   */
  permanentlyDeleteFarm(farmId: string): Observable<void> {
    const farmRef = doc(this.firestore, `farms/${farmId}`);
    return from(deleteDoc(farmRef));
  }

  // ==========================
  // ANIMAL LOCATION OPERATIONS
  // ==========================

  /**
   * Get all animals currently on a specific farm
   */
  getAnimalsOnFarm(farmId: string): Observable<any[]> {
    const tenantId = this.getCurrentTenantId();
    const animalsRef = collection(this.firestore, 'animals');
    const q = query(
      animalsRef,
      where('tenantId', '==', tenantId),
      where('currentFarmId', '==', farmId)
      // Note: Returning ALL animals on farm regardless of status
    );

    return from(getDocs(q)).pipe(
      map(snapshot => {
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
      })
    );
  }

  /**
   * Move an animal to a different farm
   */
  moveAnimalToFarm(
    animalId: string,
    fromFarmId: string | null,
    toFarmId: string,
    reason?: string,
    notes?: string
  ): Observable<void> {
    const tenantId = this.getCurrentTenantId();
    const userId = this.auth.currentUser?.uid || 'unknown';

    // Update animal's current farm
    const animalRef = doc(this.firestore, `animals/${animalId}`);
    const farmRef = doc(this.firestore, `farms/${toFarmId}`);

    const animalUpdate = from(updateDoc(animalRef, {
      currentFarmId: toFarmId,
      currentFarmRef: farmRef,
      updatedAt: serverTimestamp()
    }));

    // Create movement record
    const movementsRef = collection(this.firestore, 'farmMovements');
    const movementData: any = {
      tenantId,
      animalId,
      animalRef,
      fromFarmId,
      toFarmId,
      movementDate: new Date().toISOString().substring(0, 10),
      reason,
      movedBy: userId,
      notes,
      createdAt: serverTimestamp()
    };

    const movementCreate = from(addDoc(movementsRef, movementData));

    // Execute both operations
    return combineLatest([animalUpdate, movementCreate]).pipe(
      map(() => undefined)
    );
  }

  /**
   * Bulk move multiple animals to a farm
   */
  bulkMoveAnimals(
    animalIds: string[],
    fromFarmId: string | null,
    toFarmId: string,
    reason?: string,
    notes?: string
  ): Observable<void> {
    const moves = animalIds.map(animalId =>
      this.moveAnimalToFarm(animalId, fromFarmId, toFarmId, reason, notes)
    );

    return combineLatest(moves).pipe(
      map(() => undefined)
    );
  }

  // ============================
  // MOVEMENT HISTORY OPERATIONS
  // ============================

  /**
   * Get movement history for a specific animal
   */
  getAnimalMovementHistory(animalId: string): Observable<FarmMovement[]> {
    const movementsRef = collection(this.firestore, 'farmMovements');
    const q = query(
      movementsRef,
      where('animalId', '==', animalId),
      orderBy('movementDate', 'desc')
    );

    return from(getDocs(q)).pipe(
      map(snapshot => {
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as FarmMovement));
      })
    );
  }

  /**
   * Get all movements for a specific farm
   */
  getFarmMovementHistory(farmId: string, limit: number = 50): Observable<FarmMovement[]> {
    const movementsRef = collection(this.firestore, 'farmMovements');
    const q = query(
      movementsRef,
      where('toFarmId', '==', farmId),
      orderBy('movementDate', 'desc')
    );

    return from(getDocs(q)).pipe(
      map(snapshot => {
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as FarmMovement));
      })
    );
  }

  // =================
  // HELPER METHODS
  // =================

  /**
   * Attach animal counts to farms
   */
  private attachAnimalCounts(farms: Farm[]): Observable<Farm[]> {
    if (farms.length === 0) {
      return of([]);
    }

    const tenantId = this.getCurrentTenantId();
    const animalsRef = collection(this.firestore, 'animals');

    const countObservables = farms.map(farm => {
      const q = query(
        animalsRef,
        where('tenantId', '==', tenantId),
        where('currentFarmId', '==', farm.id)
        // Note: Counting ALL animals on farm regardless of status
        // This includes active, sold, and deceased animals
      );

      return from(getDocs(q)).pipe(
        map(snapshot => ({
          ...farm,
          currentAnimalCount: snapshot.size
        }))
      );
    });

    return combineLatest(countObservables);
  }
}