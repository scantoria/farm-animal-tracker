// src/app/shared/models/document.model.ts

import { Timestamp } from '@angular/fire/firestore';

export interface AnimalDocument {
  id?: string;
  animalId: string;
  tenantId: string;
  fileName: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  storagePath: string;
  downloadUrl: string;
  description?: string;
  documentType?: DocumentType;
  uploadedAt?: Timestamp;
  uploadedBy?: string;
}

export type DocumentType =
  | 'registration'
  | 'health_certificate'
  | 'vaccination_record'
  | 'purchase_receipt'
  | 'insurance'
  | 'pedigree'
  | 'other';

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  registration: 'Registration Papers',
  health_certificate: 'Health Certificate',
  vaccination_record: 'Vaccination Record',
  purchase_receipt: 'Purchase Receipt',
  insurance: 'Insurance Document',
  pedigree: 'Pedigree/Lineage',
  other: 'Other'
};

export const ALLOWED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain'
];

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
