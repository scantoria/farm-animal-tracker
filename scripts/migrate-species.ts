/**
 * Species Terminology Migration Script
 *
 * This script standardizes species terminology across the database.
 *
 * Standard Species Values:
 * - Cattle (replaces: Bovine, Cow, Bull, Beef, Dairy)
 * - Goat (replaces: Caprine, Capra hircus, Doe, Buck)
 * - Sheep (replaces: Ovine, Ovis aries, Ewe, Ram)
 * - Horse (replaces: Equine, Mare, Stallion)
 *
 * USAGE:
 * 1. Install Firebase Admin SDK: npm install firebase-admin
 * 2. Download service account key from Firebase Console
 * 3. Run: npx ts-node scripts/migrate-species.ts
 *
 * NOTE: This is a DRY RUN by default. Set DRY_RUN = false to execute.
 */

import * as admin from 'firebase-admin';

// CONFIGURATION
const DRY_RUN = true; // Set to false to actually perform the migration
const SERVICE_ACCOUNT_PATH = './serviceAccountKey.json'; // Path to your Firebase service account key

// Species mapping: old values -> new standardized values
const SPECIES_MAPPING: { [key: string]: string } = {
  // Cattle variations
  'bovine': 'Cattle',
  'cow': 'Cattle',
  'bull': 'Cattle',
  'beef': 'Cattle',
  'dairy': 'Cattle',
  'heifer': 'Cattle',
  'steer': 'Cattle',
  'calf': 'Cattle',

  // Goat variations
  'caprine': 'Goat',
  'capra hircus': 'Goat',
  'doe': 'Goat',
  'buck': 'Goat',
  'kid': 'Goat',

  // Sheep variations
  'ovine': 'Goat',
  'ovis aries': 'Sheep',
  'ewe': 'Sheep',
  'ram': 'Sheep',
  'lamb': 'Sheep',

  // Horse variations
  'equine': 'Horse',
  'mare': 'Horse',
  'stallion': 'Horse',
  'foal': 'Horse',
  'colt': 'Horse',
  'filly': 'Horse',
  'gelding': 'Horse',

  // Already correct (case normalization)
  'cattle': 'Cattle',
  'goat': 'Goat',
  'sheep': 'Sheep',
  'horse': 'Horse',

  // Pig (if needed later)
  'pig': 'Pig',
  'swine': 'Pig',
  'sow': 'Pig',
  'boar': 'Pig',
  'piglet': 'Pig',
};

interface MigrationResult {
  collection: string;
  documentId: string;
  oldSpecies: string;
  newSpecies: string;
  updated: boolean;
}

interface AuditResult {
  collection: string;
  speciesValues: { [key: string]: number };
  totalDocuments: number;
  needsMigration: number;
}

async function initializeFirebase() {
  const serviceAccount = require(SERVICE_ACCOUNT_PATH);

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });

  return admin.firestore();
}

function normalizeSpecies(species: string): string {
  if (!species) return species;

  const normalized = species.toLowerCase().trim();
  return SPECIES_MAPPING[normalized] || species;
}

function needsMigration(species: string): boolean {
  if (!species) return false;

  const standardValues = ['Cattle', 'Goat', 'Sheep', 'Horse', 'Pig'];
  return !standardValues.includes(species);
}

async function auditCollection(db: admin.firestore.Firestore, collectionName: string): Promise<AuditResult> {
  const result: AuditResult = {
    collection: collectionName,
    speciesValues: {},
    totalDocuments: 0,
    needsMigration: 0
  };

  try {
    const snapshot = await db.collection(collectionName).get();

    snapshot.forEach(doc => {
      const data = doc.data();
      result.totalDocuments++;

      if (data.species) {
        const species = data.species;
        result.speciesValues[species] = (result.speciesValues[species] || 0) + 1;

        if (needsMigration(species)) {
          result.needsMigration++;
        }
      }
    });
  } catch (error) {
    console.error(`Error auditing ${collectionName}:`, error);
  }

  return result;
}

async function migrateCollection(
  db: admin.firestore.Firestore,
  collectionName: string,
  dryRun: boolean
): Promise<MigrationResult[]> {
  const results: MigrationResult[] = [];

  try {
    const snapshot = await db.collection(collectionName).get();
    const batch = db.batch();
    let batchCount = 0;

    for (const doc of snapshot.docs) {
      const data = doc.data();

      if (data.species && needsMigration(data.species)) {
        const oldSpecies = data.species;
        const newSpecies = normalizeSpecies(oldSpecies);

        results.push({
          collection: collectionName,
          documentId: doc.id,
          oldSpecies,
          newSpecies,
          updated: !dryRun
        });

        if (!dryRun) {
          batch.update(doc.ref, { species: newSpecies });
          batchCount++;

          // Firestore batches are limited to 500 operations
          if (batchCount >= 500) {
            await batch.commit();
            batchCount = 0;
          }
        }
      }
    }

    if (!dryRun && batchCount > 0) {
      await batch.commit();
    }
  } catch (error) {
    console.error(`Error migrating ${collectionName}:`, error);
  }

  return results;
}

async function main() {
  console.log('='.repeat(60));
  console.log('SPECIES TERMINOLOGY MIGRATION SCRIPT');
  console.log('='.repeat(60));
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN (no changes will be made)' : 'LIVE (changes will be committed)'}`);
  console.log('');

  try {
    const db = await initializeFirebase();

    // Collections to audit and migrate
    const collections = ['animals', 'sires'];

    // PHASE 1: AUDIT
    console.log('-'.repeat(60));
    console.log('PHASE 1: AUDIT');
    console.log('-'.repeat(60));

    const auditResults: AuditResult[] = [];

    for (const collection of collections) {
      console.log(`\nAuditing ${collection}...`);
      const result = await auditCollection(db, collection);
      auditResults.push(result);

      console.log(`  Total documents: ${result.totalDocuments}`);
      console.log(`  Documents needing migration: ${result.needsMigration}`);
      console.log(`  Species values found:`);

      Object.entries(result.speciesValues)
        .sort((a, b) => b[1] - a[1])
        .forEach(([species, count]) => {
          const needsFix = needsMigration(species) ? ' ⚠️ NEEDS MIGRATION' : ' ✓';
          console.log(`    - "${species}": ${count} records${needsFix}`);
        });
    }

    // PHASE 2: MIGRATION
    console.log('\n' + '-'.repeat(60));
    console.log('PHASE 2: MIGRATION');
    console.log('-'.repeat(60));

    const migrationResults: MigrationResult[] = [];

    for (const collection of collections) {
      console.log(`\nMigrating ${collection}...`);
      const results = await migrateCollection(db, collection, DRY_RUN);
      migrationResults.push(...results);

      if (results.length === 0) {
        console.log('  No records need migration.');
      } else {
        console.log(`  ${results.length} records ${DRY_RUN ? 'would be' : 'were'} updated:`);
        results.slice(0, 10).forEach(r => {
          console.log(`    - ${r.documentId}: "${r.oldSpecies}" → "${r.newSpecies}"`);
        });
        if (results.length > 10) {
          console.log(`    ... and ${results.length - 10} more`);
        }
      }
    }

    // SUMMARY
    console.log('\n' + '='.repeat(60));
    console.log('SUMMARY');
    console.log('='.repeat(60));

    const totalNeedsMigration = auditResults.reduce((sum, r) => sum + r.needsMigration, 0);
    const totalMigrated = migrationResults.length;

    console.log(`Total documents audited: ${auditResults.reduce((sum, r) => sum + r.totalDocuments, 0)}`);
    console.log(`Documents needing migration: ${totalNeedsMigration}`);
    console.log(`Documents ${DRY_RUN ? 'that would be' : ''} migrated: ${totalMigrated}`);

    if (DRY_RUN) {
      console.log('\n⚠️  This was a DRY RUN. No changes were made.');
      console.log('    To perform the actual migration, set DRY_RUN = false');
    } else {
      console.log('\n✓ Migration complete!');
    }

  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }

  process.exit(0);
}

main();
