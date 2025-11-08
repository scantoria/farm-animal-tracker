// src/app/shared/models/health.model.ts

export interface HealthModel {
  id?: string;
  date: string;
  eventType: string;
  description: string;
  administeredBy: string;
  dosage?: string;
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