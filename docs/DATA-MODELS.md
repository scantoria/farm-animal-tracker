# Data Models Documentation

Complete database schema and data models for the Farm Animal Tracker (FAT App).

---

## Table of Contents

1. [Core Animal Models](#core-animal-models)
2. [Health & Medical Models](#health--medical-models)
3. [Breeding Models](#breeding-models)
4. [Farm Management Models](#farm-management-models)
5. [Provider Models](#provider-models)
6. [User Models](#user-models)
7. [Firestore Collections](#firestore-collections)
8. [Data Relationships](#data-relationships)

---

## Core Animal Models

### Animal

**Collection:** `animals`
**File:** `src/app/shared/models/animal.model.ts`

```typescript
interface Animal {
  id?: string;
  tenantId: string;              // Multi-tenant isolation

  // Basic Info
  name: string;                  // Animal name or identifier
  species: string;               // Cattle, Horse, Goat, Sheep, etc.
  breed: string;                 // Specific breed
  identifier: string;            // Ear tag, brand, etc.
  sex: 'Male' | 'Female';
  dob: string | Timestamp;       // Date of birth
  status: 'active' | 'sold' | 'deceased';

  // Farm Location
  currentFarmId?: string;        // Current farm location
  currentFarmRef?: DocumentReference;
  currentFarmName?: string;      // Denormalized

  // Parent Information
  sireId?: string;               // Father
  damId?: string;                // Mother

  // Additional Info
  purchaseDate?: string | Timestamp;
  purchasePrice?: number;
  currentWeight?: number;
  notes?: string;

  // Metadata
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}
```

**Factory Function:**
```typescript
export function createEmptyAnimal(tenantId: string): Partial<Animal> {
  return {
    tenantId,
    name: '',
    species: '',
    breed: '',
    identifier: '',
    sex: 'Male',
    dob: '',
    status: 'active'
  };
}
```

---

## Health & Medical Models

### Health Record

**Collection:** `animals/{animalId}/healthRecords`
**File:** `src/app/shared/models/health.model.ts`

```typescript
interface HealthModel {
  id?: string;
  date: string;                  // Event date
  eventType: string;             // Type of health event
  description: string;           // Detailed description
  administeredBy: string;        // Person who administered
  dosage?: string;               // Medication dosage if applicable
}
```

### Veterinarian Visit

**Collection:** `animals/{animalId}/veterinarianVisits`
**File:** `src/app/shared/models/veterinarian-visit.model.ts`

```typescript
interface VeterinarianVisit {
  id?: string;
  animalRef: DocumentReference;
  visitDate: string;

  // Veterinarian Info
  veterinarianRef?: DocumentReference;
  veterinarianName: string;      // Denormalized

  // Visit Details
  visitType: string;             // 'Routine Checkup', 'Emergency', 'Vaccination', etc.
  diagnosis?: string;
  treatmentProvided?: string;
  medicationsAdministered?: string;

  // Follow-up
  nextAppointmentDate?: string;
  notes?: string;
}
```

**Visit Types:**
- Routine Checkup
- Emergency
- Vaccination
- Surgery
- Medication Administration
- Other

### Medication Record

**Collection:** `animals/{animalId}/medicationRecords`
**File:** `src/app/shared/models/medication-record.model.ts`

```typescript
interface MedicationRecord {
  id?: string;
  animalRef: DocumentReference;
  visitDate: string;
  provider: string;              // Who administered
  treatmentType: string;         // Type of treatment
  medicationName: string;        // Name of medication
  dosage: string;                // Dosage amount
  notes?: string;
}
```

**Treatment Types:**
- Vaccination
- Deworming
- Injury Treatment
- Illness Treatment
- Preventative Care
- Other

---

## Breeding Models

### Breeding Event

**Collection:** `animals/{animalId}/breedingEvents`
**File:** `src/app/shared/models/breeding.model.ts`

```typescript
interface BreedingEvent {
  id?: string;
  date: string;
  eventType: string;             // 'Heat Detected', 'Breeding', etc.
  associatedAnimalRef?: DocumentReference;  // Bull/Stallion reference
  notes: string;
}
```

### Pregnancy Check

**Collection:** `animals/{animalId}/breedingEvents/{eventId}/pregnancyChecks`
**File:** `src/app/shared/models/pregnancy-check.model.ts`

```typescript
interface PregnancyCheck {
  id?: string;
  breedingEventRef: DocumentReference;
  checkDate: string;
  result: string;                // 'Pregnant', 'Open', 'Recheck Required'
  confirmationMethod: string;    // 'Ultrasound', 'Blood Test', 'Rectal Palpation'
  nextCheckDate?: string;
  notes?: string;
}
```

### Hormone Treatment

**Collection:** `animals/{animalId}/breedingEvents/{eventId}/hormoneTreatments`
**File:** `src/app/shared/models/hormone-treatment.model.ts`

```typescript
interface HormoneTreatment {
  id?: string;
  animalRef: DocumentReference;
  breedingEventRef: DocumentReference;
  treatmentDate: string;
  hormoneType: string;           // Type of hormone protocol
  productUsed: string;           // Specific product name
  dosage: string;
  notes: string;
  administeredBy: string;
}
```

**Hormone Types:**
- Heat Synchronization
- Ovulation Induction
- Pregnancy Maintenance
- Other

### Birthing Schedule

**Collection:** `animals/{animalId}/birthingSchedules`
**File:** `src/app/shared/models/birthing-schedule.model.ts`

```typescript
interface BirthingSchedule {
  id?: string;
  animalRef: DocumentReference;  // Reference to DAM (mother)

  // Birth Details
  dob: string;                   // Date of birth
  calvingEase: string;           // 'Easy', 'Assisted', 'Hard Pull', 'C-Section'
  notes?: string;

  // Offspring Details
  tagInfo: string;               // Ear tag or identifier
  dam: string;                   // Mother's name/tag
  sire: string;                  // Father's name/tag
  sex: string;                   // 'bull', 'heifer', 'colt', 'filly', etc.
  birthWeight: string;           // Birth weight
  breed: string;                 // Breed
  species: string;               // Species
}
```

### Weaning Schedule

**Collection:** `animals/{animalId}/weaningSchedules`
**File:** `src/app/shared/models/weaning-schedule.model.ts`

```typescript
interface WeaningSchedule {
  id?: string;
  animalRef: DocumentReference;
  weanDate: string;
  method: string;                // Weaning method
  notes?: string;
}
```

**Weaning Methods:**
- Abrupt
- Fence-line
- Two-stage
- Gradual
- Other

---

## Farm Management Models

### Farm

**Collection:** `farms`
**File:** `src/app/shared/models/farm.model.ts`

```typescript
interface FarmAddress {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

interface FarmFacilities {
  hasBarn: boolean;
  hayStorageCapacity?: number;   // Number of bales
  hasCattleChute: boolean;
  hasLoadingRamp: boolean;
  hasWaterSource: boolean;
  hasShelter: boolean;
  notes?: string;
}

interface Farm {
  id?: string;
  tenantId: string;
  name: string;
  address: FarmAddress;
  acreage: number;
  facilities: FarmFacilities;
  isActive: boolean;

  // Computed/Denormalized
  currentAnimalCount?: number;
  primarySupplierName?: string;
  supplierCount?: number;

  // Metadata
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}
```

**Factory Function:**
```typescript
export function createEmptyFarm(tenantId: string): Partial<Farm> {
  return {
    tenantId,
    name: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    acreage: 0,
    facilities: {
      hasBarn: false,
      hayStorageCapacity: 0,
      hasCattleChute: false,
      hasLoadingRamp: false,
      hasWaterSource: false,
      hasShelter: false,
      notes: ''
    },
    isActive: true
  };
}
```

### Farm Movement

**Collection:** `farmMovements`
**File:** `src/app/shared/models/farm-movement.model.ts`

```typescript
type MovementReason =
  | 'Winter Housing'
  | 'Summer Grazing'
  | 'Weaning'
  | 'Breeding'
  | 'Working/Processing'
  | 'Medical Treatment'
  | 'Sale Preparation'
  | 'Quarantine'
  | 'Other';

interface FarmMovement {
  id?: string;
  tenantId: string;

  // Animal Info
  animalId: string;
  animalRef?: DocumentReference;
  animalName?: string;           // Denormalized
  animalTag?: string;            // Denormalized

  // Movement Details
  fromFarmId: string | null;     // null if new animal
  fromFarmName?: string;         // Denormalized
  toFarmId: string;
  toFarmName?: string;           // Denormalized
  movementDate: string | Timestamp;
  reason?: MovementReason;

  // Tracking
  movedBy: string;               // User ID
  movedByName?: string;          // Denormalized
  notes?: string;

  // Metadata
  createdAt?: Timestamp;
}
```

---

## Provider Models

### Blacksmith

**Collection:** `blacksmiths`
**File:** `src/app/shared/models/blacksmith.model.ts`

```typescript
interface Blacksmith {
  id?: string;
  name: string;
  phone: string;
  specialty?: string;            // 'Equine Farrier', 'Cattle Hoof Trim', etc.
}
```

### Blacksmith Visit

**Collection:** `animals/{animalId}/blacksmithVisits`
**File:** `src/app/shared/models/blacksmith-visit.model.ts`

```typescript
interface BlacksmithVisit {
  id?: string;
  animalRef: DocumentReference;
  visitDate: string;
  serviceProvided: string;       // Type of service
  nextAppointmentDate?: string;
  provider: string;              // Blacksmith name
  notes?: string;
}
```

**Service Types:**
- Trim
- Shoeing-Front
- Shoeing-Hind
- Shoeing-Full
- Corrective Shoeing
- Hot Shoeing
- Therapeutic Shoeing

### Veterinarian

**Collection:** `veterinarians`
**File:** `src/app/shared/models/veterinarian.model.ts`

```typescript
interface Veterinarian {
  id?: string;
  name: string;
  phone?: string;
  email?: string;
  clinic?: string;
  specialty?: string;            // 'Bovine', 'Equine', 'Caprine', 'Ovine', 'General'
  notes?: string;
}
```

### Feed Supplier

**Collection:** `feedSuppliers`
**File:** `src/app/shared/models/feed-supplier.model.ts`

```typescript
interface SupplierContact {
  contactPerson?: string;
  phone?: string;
  email?: string;
  alternatePhone?: string;
}

interface SupplierAddress {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

interface FeedSupplier {
  id?: string;
  tenantId: string;
  name: string;
  contact: SupplierContact;
  address: SupplierAddress;
  productsOffered: string[];     // Array of product names
  deliveryAvailable: boolean;
  minimumOrder?: number;
  notes?: string;
  isActive: boolean;

  // Metadata
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}
```

**Common Feed Products:**
- Hay (Timothy, Alfalfa, Orchard Grass, Mixed)
- Grain (Corn, Oats, Barley)
- Pellets (General Purpose, Performance, Senior)
- Supplements (Minerals, Vitamins, Salt Blocks)
- Feed Additives
- Bedding (Shavings, Straw)

### Farm Supplier (Junction Table)

**Collection:** `farmSuppliers`
**File:** `src/app/shared/models/feed-supplier.model.ts`

```typescript
interface FarmSupplier {
  id?: string;
  tenantId: string;

  // Relationship
  farmId: string;
  farmName?: string;             // Denormalized
  supplierId: string;
  supplierName?: string;         // Denormalized
  isPrimary: boolean;            // Is this the primary supplier?
  deliveryNotes?: string;

  // Metadata
  createdAt?: Timestamp;
}
```

### Feed Order

**Collection:** `feedOrders`
**File:** `src/app/shared/models/feed-supplier.model.ts`

```typescript
interface FeedOrderItem {
  productName: string;
  quantity: number;
  unit: string;                  // 'bags', 'tons', 'bales', etc.
  pricePerUnit?: number;
  totalPrice?: number;
}

interface FeedOrder {
  id?: string;
  tenantId: string;

  // Parties
  farmId: string;
  farmName?: string;             // Denormalized
  supplierId: string;
  supplierName?: string;         // Denormalized

  // Order Details
  orderDate: string | Timestamp;
  deliveryDate?: string | Timestamp;
  items: FeedOrderItem[];
  totalCost?: number;
  status: 'pending' | 'in-transit' | 'delivered' | 'cancelled';
  deliveredBy?: string;
  notes?: string;

  // Metadata
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}
```

---

## User Models

### User

**Collection:** `users`
**File:** `src/app/shared/models/user.model.ts`

```typescript
interface User {
  id?: string;
  email: string;
  name: string;
  role: 'Admin' | 'User' | 'Viewer';
  createdAt?: Date | Timestamp;
  lastLogin?: Date | Timestamp;
}
```

**Roles:**
- **Admin**: Full access to all features
- **User**: Can manage animals and records
- **Viewer**: Read-only access

---

## Firestore Collections

### Top-Level Collections

| Collection | Purpose | Key Fields |
|-----------|---------|------------|
| `animals` | Main animal records | tenantId, name, species, status |
| `farms` | Farm locations | tenantId, name, acreage, isActive |
| `farmMovements` | Animal movement history | animalId, fromFarmId, toFarmId |
| `blacksmiths` | Blacksmith providers | name, phone, specialty |
| `veterinarians` | Veterinarian providers | name, clinic, specialty |
| `feedSuppliers` | Feed supplier providers | tenantId, name, isActive |
| `farmSuppliers` | Farm-Supplier relationships | farmId, supplierId, isPrimary |
| `feedOrders` | Feed order tracking | farmId, supplierId, status |
| `users` | User profiles | email, role |

### Subcollections (under animals/{animalId})

| Subcollection | Parent | Purpose |
|--------------|--------|---------|
| `healthRecords` | animals | Health and vaccination records |
| `breedingEvents` | animals | Breeding event tracking |
| `pregnancyChecks` | breedingEvents | Pregnancy verification (nested) |
| `hormoneTreatments` | breedingEvents | Hormone protocols (nested) |
| `birthingSchedules` | animals | Birth event records |
| `weaningSchedules` | animals | Weaning records |
| `blacksmithVisits` | animals | Farrier service records |
| `veterinarianVisits` | animals | Vet appointment records |
| `medicationRecords` | animals | Medication administration |

---

## Data Relationships

### Entity Relationship Diagram

```
Animal (1) ─── (Many) Health Records
           ─── (Many) Breeding Events
                      ├── (Many) Pregnancy Checks
                      └── (Many) Hormone Treatments
           ─── (Many) Birthing Schedules
           ─── (Many) Weaning Schedules
           ─── (Many) Blacksmith Visits
           ─── (Many) Veterinarian Visits
           ─── (Many) Medication Records
           ─── (1) Current Farm Location

Farm (1) ─── (Many) Animals (current location)
         ─── (Many) Farm Movements
         ─── (Many) Farm-Supplier Links
                    └── (1) Feed Supplier

Feed Supplier (1) ─── (Many) Farm-Supplier Links
                  ─── (Many) Feed Orders
```

### Reference Types

**DocumentReference:**
- Used for relationships between collections
- Allows for efficient querying
- Provides type safety

**Denormalized Fields:**
- Improve read performance
- Reduce number of queries
- Trade-off: Update complexity

---

## Indexing Strategy

### Recommended Indexes

**animals collection:**
- `tenantId` ASC, `status` ASC
- `tenantId` ASC, `currentFarmId` ASC
- `tenantId` ASC, `species` ASC

**farms collection:**
- `tenantId` ASC, `isActive` ASC

**farmMovements collection:**
- `tenantId` ASC, `animalId` ASC, `movementDate` DESC
- `tenantId` ASC, `toFarmId` ASC, `movementDate` DESC

**feedSuppliers collection:**
- `tenantId` ASC, `isActive` ASC

**feedOrders collection:**
- `tenantId` ASC, `farmId` ASC, `orderDate` DESC
- `tenantId` ASC, `supplierId` ASC, `orderDate` DESC

---

## Data Validation

### Required Fields

All models should enforce required fields at the TypeScript level and in Firestore security rules.

### Data Types

- Dates: Store as ISO string format (YYYY-MM-DD)
- Timestamps: Use Firebase `serverTimestamp()`
- References: Use Firestore `DocumentReference`
- Enums: Use TypeScript union types

---

**Last Updated:** November 2024
**Version:** 1.0.0 (MVP)
