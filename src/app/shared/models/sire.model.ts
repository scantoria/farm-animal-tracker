// src/app/shared/models/sire.model.ts

/**
 * Sire model for external breeding males (AI sires, leased bulls)
 * These are NOT part of the farm's animal herd - they are external sires
 * used for breeding purposes (artificial insemination or temporary lease).
 */
export interface Sire {
  id?: string;
  tenantId: string;

  // Basic Information
  name: string;                    // Sire name or registration number
  registrationNumber?: string;     // Official registration/ID number
  species: string;                 // Cattle, Goat, Sheep, etc.
  breed: string;                   // Breed of the sire

  // Bloodline Information (optional - may not know for external sires)
  sireName?: string;               // Name of sire's father (text, not reference)
  damName?: string;                // Name of sire's mother (text, not reference)
  bloodline?: string;              // Known bloodline/lineage information

  // Source Information
  source: 'ai' | 'leased' | 'owned'; // AI = artificial insemination, leased = temporarily borrowed
  provider?: string;               // AI company name or owner who leased the bull

  // Status
  status: 'active' | 'inactive' | 'retired';

  // Additional Information
  notes?: string;
  dateAdded?: string;              // When this sire was added to the system
}

/**
 * Sire with additional computed stats
 */
export interface SireWithStats extends Sire {
  breedingCount: number;           // Number of breeding events using this sire
}
