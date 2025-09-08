import { Injectable } from '@angular/core';
import { Firestore, collection, addDoc, collectionData, doc, deleteDoc, updateDoc } from '@angular/fire/firestore';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private firestore: Firestore) { }

  addAnimal(animal: any) {
    const animalsRef = collection(this.firestore, 'animals');
    return addDoc(animalsRef, animal);
  }

  getAnimals(): Observable<any[]> {
    const animalsRef = collection(this.firestore, 'animals');
    return collectionData(animalsRef, { idField: 'id' }) as Observable<any[]>;
  }

  deleteAnimal(animal: any) {
    const animalDocRef = doc(this.firestore, `animals/${animal.id}`);
    return deleteDoc(animalDocRef);
  }

  updateAnimal(animal: any) {
    const animalDocRef = doc(this.firestore, `animals/${animal.id}`);
    return updateDoc(animalDocRef, animal);
  }
}