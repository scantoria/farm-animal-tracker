// src/app/core/services/feed-supplier.service.ts

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
  orderBy
} from '@angular/fire/firestore';
import { Auth } from '@angular/fire/auth';
import { Observable, from, map } from 'rxjs';
import { FeedSupplier, FarmSupplier, FeedOrder } from '../../shared/models/feed-supplier.model';

@Injectable({
  providedIn: 'root'
})
export class FeedSupplierService {

  constructor(
    private firestore: Firestore,
    private auth: Auth
  ) { }

  private getCurrentTenantId(): string {
    return this.auth.currentUser?.uid || 'default-tenant';
  }

  // ========================
  // FEED SUPPLIER OPERATIONS
  // ========================

  /**
   * Get all feed suppliers for tenant
   */
  getAllSuppliers(): Observable<FeedSupplier[]> {
    const tenantId = this.getCurrentTenantId();
    const suppliersRef = collection(this.firestore, 'feedSuppliers');
    const q = query(
      suppliersRef,
      where('tenantId', '==', tenantId),
      where('isActive', '==', true)
    );

    return from(getDocs(q)).pipe(
      map(snapshot => {
        const suppliers = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as FeedSupplier));
        // Sort by name in memory
        return suppliers.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
      })
    );
  }

  /**
   * Get a single supplier by ID
   */
  getSupplierById(supplierId: string): Observable<FeedSupplier | null> {
    const supplierRef = doc(this.firestore, `feedSuppliers/${supplierId}`);
    return from(getDoc(supplierRef)).pipe(
      map(docSnap => {
        if (docSnap.exists()) {
          return { id: docSnap.id, ...docSnap.data() } as FeedSupplier;
        }
        return null;
      })
    );
  }

  /**
   * Create new supplier
   */
  createSupplier(supplier: Partial<FeedSupplier>): Observable<string> {
    const tenantId = this.getCurrentTenantId();
    const suppliersRef = collection(this.firestore, 'feedSuppliers');

    const supplierData = {
      ...supplier,
      tenantId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    return from(addDoc(suppliersRef, supplierData)).pipe(
      map(docRef => docRef.id)
    );
  }

  /**
   * Update supplier
   */
  updateSupplier(supplierId: string, updates: Partial<FeedSupplier>): Observable<void> {
    const supplierRef = doc(this.firestore, `feedSuppliers/${supplierId}`);
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp()
    };

    return from(updateDoc(supplierRef, updateData));
  }

  /**
   * Delete (soft delete) supplier
   */
  deleteSupplier(supplierId: string): Observable<void> {
    const supplierRef = doc(this.firestore, `feedSuppliers/${supplierId}`);
    return from(updateDoc(supplierRef, {
      isActive: false,
      updatedAt: serverTimestamp()
    }));
  }

  // ============================
  // FARM-SUPPLIER RELATIONSHIPS
  // ============================

  /**
   * Get all suppliers for a specific farm
   */
  getSuppliersForFarm(farmId: string): Observable<FarmSupplier[]> {
    const tenantId = this.getCurrentTenantId();
    const farmSuppliersRef = collection(this.firestore, 'farmSuppliers');
    const q = query(
      farmSuppliersRef,
      where('tenantId', '==', tenantId),
      where('farmId', '==', farmId),
      orderBy('isPrimary', 'desc')
    );

    return from(getDocs(q)).pipe(
      map(snapshot => {
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as FarmSupplier));
      })
    );
  }

  /**
   * Get all farms that use a specific supplier
   */
  getFarmsForSupplier(supplierId: string): Observable<FarmSupplier[]> {
    const tenantId = this.getCurrentTenantId();
    const farmSuppliersRef = collection(this.firestore, 'farmSuppliers');
    const q = query(
      farmSuppliersRef,
      where('tenantId', '==', tenantId),
      where('supplierId', '==', supplierId)
    );

    return from(getDocs(q)).pipe(
      map(snapshot => {
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as FarmSupplier));
      })
    );
  }

  /**
   * Link a supplier to a farm
   */
  linkSupplierToFarm(
    farmId: string,
    supplierId: string,
    isPrimary: boolean = false,
    deliveryNotes?: string
  ): Observable<string> {
    const tenantId = this.getCurrentTenantId();
    const farmSuppliersRef = collection(this.firestore, 'farmSuppliers');

    const linkData = {
      tenantId,
      farmId,
      supplierId,
      isPrimary,
      deliveryNotes,
      createdAt: serverTimestamp()
    };

    return from(addDoc(farmSuppliersRef, linkData)).pipe(
      map(docRef => docRef.id)
    );
  }

  /**
   * Update farm-supplier relationship
   */
  updateFarmSupplierLink(
    linkId: string,
    updates: Partial<FarmSupplier>
  ): Observable<void> {
    const linkRef = doc(this.firestore, `farmSuppliers/${linkId}`);
    return from(updateDoc(linkRef, updates));
  }

  /**
   * Remove supplier from farm
   */
  unlinkSupplierFromFarm(linkId: string): Observable<void> {
    const linkRef = doc(this.firestore, `farmSuppliers/${linkId}`);
    return from(deleteDoc(linkRef));
  }

  /**
   * Set primary supplier for a farm
   */
  setPrimarySupplier(farmId: string, supplierId: string): Observable<void> {
    // First, get all links for this farm
    return this.getSuppliersForFarm(farmId).pipe(
      map(links => {
        // Update all links
        const updates = links.map(link => {
          const linkRef = doc(this.firestore, `farmSuppliers/${link.id}`);
          return updateDoc(linkRef, {
            isPrimary: link.supplierId === supplierId
          });
        });
        return Promise.all(updates);
      }),
      map(() => undefined)
    );
  }

  // ===================
  // FEED ORDER TRACKING
  // ===================

  /**
   * Get all orders for a farm
   */
  getOrdersForFarm(farmId: string): Observable<FeedOrder[]> {
    const tenantId = this.getCurrentTenantId();
    const ordersRef = collection(this.firestore, 'feedOrders');
    const q = query(
      ordersRef,
      where('tenantId', '==', tenantId),
      where('farmId', '==', farmId),
      orderBy('orderDate', 'desc')
    );

    return from(getDocs(q)).pipe(
      map(snapshot => {
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as FeedOrder));
      })
    );
  }

  /**
   * Get all orders from a supplier
   */
  getOrdersFromSupplier(supplierId: string): Observable<FeedOrder[]> {
    const tenantId = this.getCurrentTenantId();
    const ordersRef = collection(this.firestore, 'feedOrders');
    const q = query(
      ordersRef,
      where('tenantId', '==', tenantId),
      where('supplierId', '==', supplierId),
      orderBy('orderDate', 'desc')
    );

    return from(getDocs(q)).pipe(
      map(snapshot => {
        return snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as FeedOrder));
      })
    );
  }

  /**
   * Create a new feed order
   */
  createOrder(order: Partial<FeedOrder>): Observable<string> {
    const tenantId = this.getCurrentTenantId();
    const ordersRef = collection(this.firestore, 'feedOrders');

    const orderData = {
      ...order,
      tenantId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    return from(addDoc(ordersRef, orderData)).pipe(
      map(docRef => docRef.id)
    );
  }

  /**
   * Update an order
   */
  updateOrder(orderId: string, updates: Partial<FeedOrder>): Observable<void> {
    const orderRef = doc(this.firestore, `feedOrders/${orderId}`);
    const updateData = {
      ...updates,
      updatedAt: serverTimestamp()
    };

    return from(updateDoc(orderRef, updateData));
  }

  /**
   * Delete an order
   */
  deleteOrder(orderId: string): Observable<void> {
    const orderRef = doc(this.firestore, `feedOrders/${orderId}`);
    return from(deleteDoc(orderRef));
  }
}
