// src/app/shared/models/weight-record.model.ts

import { Timestamp } from '@angular/fire/firestore';

/**
 * WeightRecord model for tracking animal weight over time.
 * Used primarily for calf growth tracking with ADG calculations.
 * Stored as subcollection: animals/{animalId}/weightRecords/{recordId}
 */
export interface WeightRecord {
  id?: string;
  animalId: string;
  weight: number;             // lbs
  weighDate: string | Timestamp;
  ageInDays: number;          // Calculated on entry based on animal DOB
  adgSinceLastWeigh?: number; // Average Daily Gain since previous weigh (lbs/day)
  daysSinceLastWeigh?: number;
  cumulativeADG?: number;     // Overall ADG from birth to this weigh
  notes?: string;
  createdAt?: Timestamp;
  createdBy: string;
}

/**
 * Growth tracking constants for beef cattle
 */
export const GROWTH_CONSTANTS = {
  TARGET_ADG: 3,              // Target average daily gain (lbs/day)
  TARGET_SALE_WEIGHT: 600,    // Target sale weight (lbs)
  SALE_READY_WEIGHT: 575,     // Minimum weight to be considered sale-ready (lbs)
  ADG_GOOD_THRESHOLD: 3,      // ADG >= 3 is good (green)
  ADG_WARNING_THRESHOLD: 2,   // ADG 2-3 is acceptable (yellow), < 2 is poor (red)
};

/**
 * Type for ADG status badge display
 */
export type ADGStatus = 'good' | 'warning' | 'poor';

/**
 * Helper function to determine ADG status
 */
export function getADGStatus(adg: number): ADGStatus {
  if (adg >= GROWTH_CONSTANTS.ADG_GOOD_THRESHOLD) {
    return 'good';
  } else if (adg >= GROWTH_CONSTANTS.ADG_WARNING_THRESHOLD) {
    return 'warning';
  }
  return 'poor';
}
