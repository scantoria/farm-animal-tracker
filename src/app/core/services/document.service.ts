// src/app/core/services/document.service.ts

import { Injectable } from '@angular/core';
import {
  Storage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  UploadTaskSnapshot
} from '@angular/fire/storage';
import {
  Firestore,
  collection,
  addDoc,
  doc,
  deleteDoc,
  query,
  where,
  collectionData,
  Timestamp
} from '@angular/fire/firestore';
import { from, Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import {
  AnimalDocument,
  DocumentType,
  ALLOWED_FILE_TYPES,
  MAX_FILE_SIZE
} from '../../shared/models/document.model';

export interface UploadProgress {
  progress: number;
  state: 'running' | 'paused' | 'success' | 'error';
  bytesTransferred: number;
  totalBytes: number;
}

@Injectable({
  providedIn: 'root'
})
export class DocumentService {
  private uploadProgress$ = new Subject<UploadProgress>();

  constructor(
    private storage: Storage,
    private firestore: Firestore
  ) {}

  /**
   * Validates a file before upload
   */
  validateFile(file: File): { valid: boolean; error?: string } {
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      return {
        valid: false,
        error: 'File type not allowed. Please upload images, PDFs, or Office documents.'
      };
    }

    if (file.size > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit.`
      };
    }

    return { valid: true };
  }

  /**
   * Uploads a file to Firebase Storage and saves metadata to Firestore
   */
  uploadDocument(
    file: File,
    animalId: string,
    tenantId: string,
    documentType?: DocumentType,
    description?: string
  ): Observable<AnimalDocument> {
    return new Observable(observer => {
      // Validate file first
      const validation = this.validateFile(file);
      if (!validation.valid) {
        observer.error(new Error(validation.error));
        return;
      }

      // Generate unique filename
      const timestamp = Date.now();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${timestamp}_${sanitizedName}`;
      const storagePath = `documents/${tenantId}/${animalId}/${fileName}`;

      // Create storage reference
      const storageRef = ref(this.storage, storagePath);

      // Start upload
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot: UploadTaskSnapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          this.uploadProgress$.next({
            progress,
            state: snapshot.state as 'running' | 'paused',
            bytesTransferred: snapshot.bytesTransferred,
            totalBytes: snapshot.totalBytes
          });
        },
        (error) => {
          this.uploadProgress$.next({
            progress: 0,
            state: 'error',
            bytesTransferred: 0,
            totalBytes: file.size
          });
          observer.error(error);
        },
        async () => {
          try {
            // Get download URL
            const downloadUrl = await getDownloadURL(storageRef);

            // Save metadata to Firestore
            const documentData: Omit<AnimalDocument, 'id'> = {
              animalId,
              tenantId,
              fileName,
              originalName: file.name,
              fileType: file.type,
              fileSize: file.size,
              storagePath,
              downloadUrl,
              description,
              documentType,
              uploadedAt: Timestamp.now()
            };

            const docRef = await addDoc(
              collection(this.firestore, 'animalDocuments'),
              documentData
            );

            this.uploadProgress$.next({
              progress: 100,
              state: 'success',
              bytesTransferred: file.size,
              totalBytes: file.size
            });

            observer.next({
              ...documentData,
              id: docRef.id
            });
            observer.complete();
          } catch (error) {
            observer.error(error);
          }
        }
      );
    });
  }

  /**
   * Get upload progress as an observable
   */
  getUploadProgress(): Observable<UploadProgress> {
    return this.uploadProgress$.asObservable();
  }

  /**
   * Get all documents for an animal
   */
  getDocumentsByAnimalId(animalId: string): Observable<AnimalDocument[]> {
    const documentsCollection = collection(this.firestore, 'animalDocuments');
    const q = query(documentsCollection, where('animalId', '==', animalId));
    return collectionData(q, { idField: 'id' }) as Observable<AnimalDocument[]>;
  }

  /**
   * Delete a document (both from Storage and Firestore)
   */
  deleteDocument(document: AnimalDocument): Observable<void> {
    return new Observable(observer => {
      const deleteOperations = async () => {
        try {
          // Delete from Storage
          const storageRef = ref(this.storage, document.storagePath);
          await deleteObject(storageRef);

          // Delete from Firestore
          if (document.id) {
            const docRef = doc(this.firestore, `animalDocuments/${document.id}`);
            await deleteDoc(docRef);
          }

          observer.next();
          observer.complete();
        } catch (error) {
          observer.error(error);
        }
      };

      deleteOperations();
    });
  }

  /**
   * Get file icon based on file type
   */
  getFileIcon(fileType: string): string {
    if (fileType.startsWith('image/')) {
      return 'bi-file-image';
    } else if (fileType === 'application/pdf') {
      return 'bi-file-pdf';
    } else if (
      fileType.includes('word') ||
      fileType.includes('document')
    ) {
      return 'bi-file-word';
    } else if (
      fileType.includes('excel') ||
      fileType.includes('spreadsheet')
    ) {
      return 'bi-file-excel';
    } else if (fileType === 'text/plain') {
      return 'bi-file-text';
    }
    return 'bi-file-earmark';
  }

  /**
   * Format file size for display
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Upload an animal profile image
   */
  uploadAnimalImage(
    file: File,
    animalId: string,
    tenantId: string
  ): Observable<{ downloadUrl: string; storagePath: string }> {
    return new Observable(observer => {
      // Validate file is an image
      if (!file.type.startsWith('image/')) {
        observer.error(new Error('Please select an image file (JPG, PNG, GIF, etc.)'));
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        observer.error(new Error(`Image size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit.`));
        return;
      }

      // Generate unique filename
      const timestamp = Date.now();
      const extension = file.name.split('.').pop() || 'jpg';
      const fileName = `${animalId}_${timestamp}.${extension}`;
      const storagePath = `animal-images/${tenantId}/${fileName}`;

      // Create storage reference
      const storageRef = ref(this.storage, storagePath);

      // Start upload
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          this.uploadProgress$.next({
            progress,
            state: snapshot.state as 'running' | 'paused',
            bytesTransferred: snapshot.bytesTransferred,
            totalBytes: snapshot.totalBytes
          });
        },
        (error) => {
          this.uploadProgress$.next({
            progress: 0,
            state: 'error',
            bytesTransferred: 0,
            totalBytes: file.size
          });
          observer.error(error);
        },
        async () => {
          try {
            const downloadUrl = await getDownloadURL(storageRef);
            this.uploadProgress$.next({
              progress: 100,
              state: 'success',
              bytesTransferred: file.size,
              totalBytes: file.size
            });
            observer.next({ downloadUrl, storagePath });
            observer.complete();
          } catch (error) {
            observer.error(error);
          }
        }
      );
    });
  }

  /**
   * Delete an animal profile image from storage
   */
  deleteAnimalImage(storagePath: string): Observable<void> {
    return new Observable(observer => {
      const storageRef = ref(this.storage, storagePath);
      deleteObject(storageRef)
        .then(() => {
          observer.next();
          observer.complete();
        })
        .catch(error => {
          observer.error(error);
        });
    });
  }
}
