// src/app/shared/models/health.model.ts

export interface HealthModel {
  id?: string;
  date: string;
  eventType: string;
  description: string;
  administeredBy: string;
  dosage?: string;
}