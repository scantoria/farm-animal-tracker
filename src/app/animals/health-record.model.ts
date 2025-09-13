// src/app/animals/health-record.model.ts

export interface HealthRecord {
  id?: string;
  date: string; // Storing as string to avoid Timestamp issues
  eventType: string;
  description: string;
  administeredBy: string;
  dosage?: string;
}