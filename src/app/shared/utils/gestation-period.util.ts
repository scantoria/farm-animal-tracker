// src/app/shared/utils/gestation-period.util.ts

/**
 * Gestation periods in days for different species
 */
export const GESTATION_PERIODS: { [key: string]: number } = {
  'cattle': 283,
  'cow': 283,
  'bull': 283,
  'beef': 283,
  'dairy': 283,
  'sheep': 150,
  'ewe': 150,
  'ram': 150,
  'goat': 150,
  'doe': 150,
  'buck': 150,
  'pig': 114,
  'sow': 114,
  'boar': 114,
  'swine': 114,
  'horse': 340,
  'mare': 340,
  'stallion': 340,
  'llama': 350,
  'alpaca': 335,
  'donkey': 365,
  'mule': 365
};

/**
 * Get gestation period in days for a given species
 * @param species - The species name (case-insensitive)
 * @returns Gestation period in days, or 283 (cattle default) if species not found
 */
export function getGestationPeriod(species: string): number {
  const normalizedSpecies = species.toLowerCase().trim();
  return GESTATION_PERIODS[normalizedSpecies] || 283; // Default to cattle
}

/**
 * Calculate expected due date based on breeding date and species
 * @param breedingDate - The date of breeding (string or Date)
 * @param species - The species name
 * @returns Expected due date as Date object, or null if breedingDate is invalid
 */
export function calculateDueDate(breedingDate: string | Date, species: string): Date | null {
  if (!breedingDate) {
    return null;
  }

  const date = typeof breedingDate === 'string' ? new Date(breedingDate) : breedingDate;

  if (isNaN(date.getTime())) {
    return null;
  }

  const gestationDays = getGestationPeriod(species);
  const dueDate = new Date(date);
  dueDate.setDate(dueDate.getDate() + gestationDays);

  return dueDate;
}

/**
 * Format a date as MM/DD/YYYY
 * @param date - The date to format
 * @returns Formatted date string
 */
export function formatDueDate(date: Date | null): string {
  if (!date) {
    return 'N/A';
  }

  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const year = date.getFullYear();

  return `${month}/${day}/${year}`;
}

/**
 * Get reproductive status options based on sex
 * @param sex - 'male' or 'female'
 * @returns Array of valid reproductive status options
 */
export function getReproductiveStatusOptions(sex: 'male' | 'female'): Array<{value: string, label: string}> {
  if (sex === 'female') {
    return [
      { value: 'open', label: 'Open' },
      { value: 'pregnant', label: 'Pregnant' },
      { value: 'unknown', label: 'Unknown' }
    ];
  } else {
    return [
      { value: 'intact', label: 'Intact' },
      { value: 'castrated', label: 'Castrated' },
      { value: 'unknown', label: 'Unknown' }
    ];
  }
}
