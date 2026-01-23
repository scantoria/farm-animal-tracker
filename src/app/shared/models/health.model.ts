// src/app/shared/models/health.model.ts

import { Timestamp } from '@angular/fire/firestore';

export interface HealthRecordDocument {
  id?: string;
  fileName: string;
  originalName: string;
  fileType: string;
  fileSize: number;
  storagePath: string;
  downloadUrl: string;
  description?: string;
  uploadedAt?: Timestamp;
}

export interface HealthModel {
  id?: string;
  date: string;
  eventType: string;
  description: string;
  administeredBy: string;
  dosage?: string;
  // Document attachments
  documents?: HealthRecordDocument[];
}

export const HEALTH_EVENT_TYPES = [
  'hoof_trimming',
  'vaccination',
  'castration',
  'dehorning',
  'general_checkup',
  'injury',
  'illness',
  'other'
];