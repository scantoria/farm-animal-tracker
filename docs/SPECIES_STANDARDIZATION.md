# Species Terminology Standardization

## Overview

This document describes the standardization of species terminology across the Farm Animal Tracker application.

## Standard Species Values

The following are the ONLY valid species values:

| Species | Description |
|---------|-------------|
| **Cattle** | All bovines (cows, bulls, heifers, steers, calves) |
| **Goat** | All caprines (does, bucks, kids) |
| **Sheep** | All ovines (ewes, rams, lambs) |
| **Horse** | All equines (mares, stallions, foals, colts, fillies, geldings) |

## Audit Findings

### Legacy Values Found in Code

| Legacy Value | Standard Value | Found In |
|--------------|----------------|----------|
| `Bovine` | `Cattle` | birthing-schedule.model.ts (comment) |
| `Equine` | `Horse` | birthing-schedule.model.ts (comment) |
| `Capra hircus` | `Goat` | birthing-schedule.model.ts (comment) |
| `Ovis aries` | `Sheep` | birthing-schedule.model.ts (comment) |

### Collections with Species Field

| Collection | Field | Status |
|------------|-------|--------|
| `animals` | `species` | ✅ Updated to dropdown |
| `sires` | `species` | ✅ Already uses dropdown |

## Changes Made

### 1. Species Dropdowns Updated

**Files Modified:**

- `src/app/features/animals/components/add-animal/add-animal.component.html`
  - Changed species from free-text input to dropdown
  - Options: Cattle, Goat, Sheep, Horse

- `src/app/features/animals/components/edit-animal/edit-animal.component.html`
  - Changed species from free-text input to dropdown
  - Options: Cattle, Goat, Sheep, Horse
  - Added `onSpeciesChange()` handler to reload sires

- `src/app/features/animals/components/edit-animal/edit-animal.component.ts`
  - Added `onSpeciesChange()` method to reload sires when species changes

**Already Correct:**

- `src/app/features/admin/sires/components/add-sire/add-sire.component.html`
- `src/app/features/admin/sires/components/edit-sire/edit-sire.component.html`

### 2. Species Constants Created

**New File:** `src/app/shared/constants/species.constants.ts`

Contains:
- `STANDARD_SPECIES` - Array of valid species
- `SPECIES_OPTIONS` - Dropdown options
- `SPECIES_ALIASES` - Mapping of legacy values to standard
- `normalizeSpecies()` - Function to normalize species values
- `isValidSpecies()` - Function to validate species values

### 3. Migration Script Created

**New File:** `scripts/migrate-species.ts`

Purpose: Migrates existing database records from legacy species values to standard terminology.

**Features:**
- Dry run mode (default) for safe testing
- Audits all collections with species fields
- Reports counts of each species value found
- Batch updates for efficient migration
- Rollback capability (delete script outputs before running)

**Usage:**
```bash
# Install dependencies
npm install firebase-admin

# Run in dry-run mode (default)
npx ts-node scripts/migrate-species.ts

# Run actual migration (after review)
# Edit script: set DRY_RUN = false
npx ts-node scripts/migrate-species.ts
```

## Migration Steps

### Before Running Migration

1. **Backup your database** - Export your Firestore data
2. **Review the audit** - Run script in dry-run mode first
3. **Test on staging** - If available, test on a staging environment

### Running the Migration

1. Download Firebase service account key from Firebase Console
2. Save as `serviceAccountKey.json` in project root
3. Run the migration script in dry-run mode
4. Review the output
5. If satisfied, set `DRY_RUN = false` and run again

### After Migration

1. Verify records in Firebase Console
2. Test the application thoroughly
3. Remove the service account key file

## Gestation Period Mapping

The gestation period utility (`src/app/shared/utils/gestation-period.util.ts`) already handles variations:

| Input (case-insensitive) | Gestation Days |
|-------------------------|----------------|
| cattle, cow, bull, beef, dairy | 283 |
| sheep, ewe, ram | 150 |
| goat, doe, buck | 150 |
| horse, mare, stallion | 340 |

## Schema Documentation

### animals Collection

```typescript
{
  species: string;  // Standard values: 'Cattle', 'Goat', 'Sheep', 'Horse'
  // ... other fields
}
```

### sires Collection

```typescript
{
  species: string;  // Standard values: 'Cattle', 'Goat', 'Sheep', 'Horse'
  // ... other fields
}
```

## Recommendations

1. **Database Constraint** (Future): Consider adding Firestore Security Rules to validate species values
2. **Form Validation** (Implemented): Species dropdowns now enforce valid options
3. **Data Entry** (Implemented): Changed from free-text to dropdown to prevent new inconsistencies

## Success Criteria Checklist

- [x] Complete audit report of current species values
- [x] Migration script created and ready for review
- [x] Species dropdown shows only: Cattle, Goat, Sheep, Horse
- [x] Bulls/Sire/Buck registry aligned to standard species
- [x] Schema documentation complete
- [ ] Migration script executed (requires database access)
- [ ] Query verification after migration (requires database access)
