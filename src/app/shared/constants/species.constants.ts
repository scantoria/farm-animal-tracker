// src/app/shared/constants/species.constants.ts

/**
 * Standard species terminology for the Farm Animal Tracker.
 * These are the ONLY valid species values that should be stored in the database.
 */
export const STANDARD_SPECIES = ['Cattle', 'Goat', 'Sheep', 'Horse'] as const;

export type StandardSpecies = typeof STANDARD_SPECIES[number];

/**
 * Species options for dropdown menus
 */
export const SPECIES_OPTIONS: Array<{ value: StandardSpecies; label: string }> = [
  { value: 'Cattle', label: 'Cattle' },
  { value: 'Goat', label: 'Goat' },
  { value: 'Sheep', label: 'Sheep' },
  { value: 'Horse', label: 'Horse' }
];

/**
 * Mapping of legacy/alternative species names to standard names.
 * Used for data migration and validation.
 */
export const SPECIES_ALIASES: { [key: string]: StandardSpecies } = {
  // Cattle aliases
  'bovine': 'Cattle',
  'cow': 'Cattle',
  'bull': 'Cattle',
  'beef': 'Cattle',
  'dairy': 'Cattle',
  'heifer': 'Cattle',
  'steer': 'Cattle',
  'calf': 'Cattle',

  // Goat aliases
  'caprine': 'Goat',
  'capra hircus': 'Goat',
  'doe': 'Goat',
  'buck': 'Goat',
  'kid': 'Goat',

  // Sheep aliases
  'ovine': 'Sheep',
  'ovis aries': 'Sheep',
  'ewe': 'Sheep',
  'ram': 'Sheep',
  'lamb': 'Sheep',

  // Horse aliases
  'equine': 'Horse',
  'mare': 'Horse',
  'stallion': 'Horse',
  'foal': 'Horse',
  'colt': 'Horse',
  'filly': 'Horse',
  'gelding': 'Horse'
};

/**
 * Normalize a species value to standard terminology.
 * Returns the standardized species name or the original value if not recognized.
 *
 * @param species - The species value to normalize
 * @returns The standardized species name
 */
export function normalizeSpecies(species: string): string {
  if (!species) return species;

  // Check if already a standard species
  if (STANDARD_SPECIES.includes(species as StandardSpecies)) {
    return species;
  }

  // Check aliases
  const normalized = species.toLowerCase().trim();
  return SPECIES_ALIASES[normalized] || species;
}

/**
 * Check if a species value is a valid standard species.
 *
 * @param species - The species value to check
 * @returns True if the species is a valid standard species
 */
export function isValidSpecies(species: string): boolean {
  return STANDARD_SPECIES.includes(species as StandardSpecies);
}
