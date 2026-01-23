// src/app/core/services/user-data.service.ts

import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  deleteDoc,
  updateDoc,
  getDoc,
  serverTimestamp
} from '@angular/fire/firestore';
import { User } from '../../shared/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UserDataService {
  private usersCollection = 'users';

  constructor(private firestore: Firestore) {}

  /**
   * Retrieves all users from the 'users' collection.
   * @returns An Observable array of User objects.
   */
  getAllUsers(): Observable<User[]> {
    const usersRef = collection(this.firestore, this.usersCollection);
    return collectionData(usersRef, { idField: 'id' }) as Observable<User[]>;
  }

  /**
   * Retrieves a single user by ID.
   * @param id The user document ID.
   * @returns An Observable of the User or undefined if not found.
   */
  getUserById(id: string): Observable<User | undefined> {
    const userDocRef = doc(this.firestore, `${this.usersCollection}/${id}`);
    return from(getDoc(userDocRef)).pipe(
      map(docSnap => {
        if (docSnap.exists()) {
          return {
            id: docSnap.id,
            ...docSnap.data()
          } as User;
        }
        return undefined;
      })
    );
  }

  /**
   * Updates an existing user record.
   * @param id The user document ID.
   * @param updates Partial user data to update.
   * @returns A Promise that resolves when the update is complete.
   */
  updateUser(id: string, updates: Partial<User>): Promise<void> {
    const userDocRef = doc(this.firestore, `${this.usersCollection}/${id}`);
    return updateDoc(userDocRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });
  }

  /**
   * Deletes a user record by ID.
   * @param id The ID of the user to delete.
   * @returns A Promise that resolves when the deletion is complete.
   */
  deleteUser(id: string): Promise<void> {
    const userDocRef = doc(this.firestore, `${this.usersCollection}/${id}`);
    return deleteDoc(userDocRef);
  }
}