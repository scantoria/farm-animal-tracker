// src/app/animals.service.ts

import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc } from '@angular/fire/firestore';
import { Animal } from './animals/animal.model'; // Import the Animal interface
import { from } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AnimalsService {

  constructor(private firestore: Firestore) { }

  // Update the method to accept an Animal object
  addAnimal(animal: Animal) {
    const animalsCollection = collection(this.firestore, 'animals');
    // Remove the id property before adding to Firestore as it's not needed in the document itself.
    const { id, ...animalData } = animal;
    return from(addDoc(animalsCollection, animalData));
  }
}