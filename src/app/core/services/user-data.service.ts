// src/app/core/services/user-data.service.ts

import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Firestore, collection, collectionData, doc, deleteDoc, updateDoc, setDoc } from '@angular/fire/firestore';
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
    // Cast the observable data to the User interface
    return collectionData(usersRef, { idField: 'id' }) as Observable<User[]>;
  }

  /**
   * Retrieves a single user by ID.
   * NOTE: This is included for the 'edit' view later.
   */
  getUserById(id: string): Observable<User | undefined> {
    // You would typically use a method that specifically fetches one document
    // For simplicity, we'll keep the basic structure here, assuming a method exists
    // that filters or directly fetches a doc by ID. For now, we omit the implementation
    // until the 'edit-user' component is needed.
    throw new Error('Method not implemented yet.');
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

  /**
   * Adds a new user to the registry.
   * NOTE: In a real app, user creation/signup should be handled by Firebase Auth.
   */
  // addUpdateUser(user: User): Promise<void> { /* ... implementation for add/edit */ }
}