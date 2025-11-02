# API Documentation

Service layer and data access documentation for the Farm Animal Tracker (FAT App).

---

## Service Architecture

All data access is handled through Angular services that interact with Firebase Firestore. Services return RxJS Observables for reactive data streams.

**Base Pattern:**
```
Component → Service → Firestore → Service → Component
```

---

## Core Services

### Animals Service

**File:** `src/app/core/services/animals.service.ts`
**Collection:** `animals`

#### Methods

**addAnimal(animal: Animal): Observable<DocumentReference>**
- Creates a new animal record
- Automatically adds tenantId from current user
- Returns Firestore document reference

```typescript
const newAnimal: Animal = {
  tenantId: 'user-uid',
  name: 'Bessie',
  species: 'Cattle',
  breed: 'Angus',
  //...
};
this.animalsService.addAnimal(newAnimal).subscribe(docRef => {
  console.log('Created:', docRef.id);
});
```

**getAll(): Observable<Animal[]>**
- Retrieves all animals for current tenant
- Filtered by tenantId
- Returns array of Animal objects

```typescript
this.animals$ = this.animalsService.getAll();
```

**getAnimal(animalId: string): Observable<Animal | undefined>**
- Retrieves single animal by ID
- Returns undefined if not found

```typescript
this.animalsService.getAnimal(id).subscribe(animal => {
  if (animal) {
    console.log(animal.name);
  }
});
```

**updateAnimal(animal: Animal): Observable<void>**
- Updates existing animal record
- Requires full animal object with id

```typescript
const updatedAnimal = { ...existingAnimal, name: 'New Name' };
this.animalsService.updateAnimal(updatedAnimal).subscribe();
```

**deleteAnimal(animal: Animal): Observable<void>**
- Deletes animal record from Firestore
- Cascading deletes must be handled separately

```typescript
this.animalsService.deleteAnimal(animal).subscribe(() => {
  console.log('Deleted');
});
```

---

### Health Service

**File:** `src/app/core/services/health.service.ts`
**Collection:** `animals/{animalId}/healthRecords`

#### Methods

**addHealthRecord(animalId: string, healthModel: HealthModel): Observable<DocumentReference>**
- Creates new health record for specified animal
- Subcollection under animal document

**getHealthRecordsByAnimalId(animalId: string): Observable<HealthModel[]>**
- Retrieves all health records for an animal
- Sorted by date (descending)

**getHealthRecord(animalId: string, recordId: string): Observable<HealthModel>**
- Retrieves single health record

**updateHealthRecord(animalId: string, recordId: string, updatedRecord: Partial<HealthModel>): Observable<void>**
- Updates existing health record
- Supports partial updates

**deleteHealthRecord(animalId: string, recordId: string): Observable<void>**
- Deletes specific health record

---

### Breeding Service

**File:** `src/app/core/services/breeding.service.ts`
**Collections:**
- `animals/{animalId}/breedingEvents`
- `animals/{animalId}/breedingEvents/{eventId}/pregnancyChecks`
- `animals/{animalId}/breedingEvents/{eventId}/hormoneTreatments`

#### Breeding Event Methods

**addBreedingEvent(animalId: string, breedingEvent: BreedingEvent): Observable<DocumentReference>**

**getBreedingEventsByAnimalId(animalId: string): Observable<BreedingEvent[]>**

**getBreedingEvent(animalId: string, eventId: string): Observable<BreedingEvent>**

**updateBreedingEvent(animalId: string, eventId: string, updatedEvent: Partial<BreedingEvent>): Observable<void>**

**deleteBreedingEvent(animalId: string, eventId: string): Observable<void>**

#### Pregnancy Check Methods

**addPregnancyCheck(animalId: string, eventId: string, pregnancyCheck: PregnancyCheck): Observable<DocumentReference>**
- Creates pregnancy check nested under breeding event

**getPregnancyChecksByBreedingEventId(animalId: string, eventId: string): Observable<PregnancyCheck[]>**
- Retrieves all checks for a breeding event

**getPregnancyCheck(animalId: string, eventId: string, checkId: string): Observable<PregnancyCheck>**

**updatePregnancyCheck(animalId: string, eventId: string, checkId: string, updatedCheck: Partial<PregnancyCheck>): Observable<void>**

**deletePregnancyCheck(animalId: string, eventId: string, checkId: string): Observable<void>**

#### Hormone Treatment Methods

**addHormoneTreatment(animalId: string, eventId: string, hormoneTreatment: HormoneTreatment): Observable<DocumentReference>**

**getHormoneTreatmentsByBreedingEventId(animalId: string, eventId: string): Observable<HormoneTreatment[]>**

**getHormoneTreatment(animalId: string, eventId: string, treatmentId: string): Observable<HormoneTreatment | undefined>**

**updateHormoneTreatment(animalId: string, eventId: string, treatmentId: string, updatedTreatment: Partial<HormoneTreatment>): Observable<void>**

**deleteHormoneTreatment(animalId: string, eventId: string, treatmentId: string): Observable<void>**

---

### Farm Service

**File:** `src/app/core/services/farm.service.ts`
**Collections:** `farms`, `farmMovements`

#### Farm CRUD Methods

**getAllFarms(): Observable<Farm[]>**
- Returns all active farms for tenant
- Includes animal counts
- Sorted by name (in-memory)

**getFarmById(farmId: string): Observable<Farm | null>**

**createFarm(farm: Partial<Farm>): Observable<string>**
- Creates new farm
- Returns farm ID

**updateFarm(farmId: string, updates: Partial<Farm>): Observable<void>**
- Supports partial updates

**deleteFarm(farmId: string): Observable<void>**
- Soft delete (sets isActive = false)

**permanentlyDeleteFarm(farmId: string): Observable<void>**
- Hard delete (use with caution)

#### Animal Location Methods

**getAnimalsOnFarm(farmId: string): Observable<any[]>**
- Returns all animals currently on specified farm

**moveAnimalToFarm(animalId: string, fromFarmId: string | null, toFarmId: string, reason?: string, notes?: string): Observable<void>**
- Moves animal to different farm
- Creates movement record
- Updates animal's currentFarmId

**bulkMoveAnimals(animalIds: string[], fromFarmId: string | null, toFarmId: string, reason?: string, notes?: string): Observable<void>**
- Moves multiple animals at once
- Efficient batch operation

#### Movement History Methods

**getAnimalMovementHistory(animalId: string): Observable<FarmMovement[]>**
- Returns movement history for specific animal
- Sorted by date (descending)

**getFarmMovementHistory(farmId: string, limit?: number): Observable<FarmMovement[]>**
- Returns all movements to/from specific farm
- Optional limit parameter

---

### Feed Supplier Service

**File:** `src/app/core/services/feed-supplier.service.ts`
**Collections:** `feedSuppliers`, `farmSuppliers`, `feedOrders`

#### Supplier Methods

**getAllSuppliers(): Observable<FeedSupplier[]>**
- Returns all active suppliers for tenant
- Sorted by name (in-memory)

**getSupplierById(supplierId: string): Observable<FeedSupplier | null>**

**createSupplier(supplier: Partial<FeedSupplier>): Observable<string>**

**updateSupplier(supplierId: string, updates: Partial<FeedSupplier>): Observable<void>**

**deleteSupplier(supplierId: string): Observable<void>**
- Soft delete (sets isActive = false)

#### Farm-Supplier Relationship Methods

**getSuppliersForFarm(farmId: string): Observable<FarmSupplier[]>**
- Returns all suppliers linked to a farm
- Sorted by isPrimary (descending)

**getFarmsForSupplier(supplierId: string): Observable<FarmSupplier[]>**
- Returns all farms using a supplier

**linkSupplierToFarm(farmId: string, supplierId: string, isPrimary?: boolean, deliveryNotes?: string): Observable<string>**
- Creates relationship between farm and supplier

**updateFarmSupplierLink(linkId: string, updates: Partial<FarmSupplier>): Observable<void>**

**unlinkSupplierFromFarm(linkId: string): Observable<void>**
- Removes relationship

**setPrimarySupplier(farmId: string, supplierId: string): Observable<void>**
- Sets one supplier as primary for a farm
- Automatically unsets other primary flags

#### Feed Order Methods

**getOrdersForFarm(farmId: string): Observable<FeedOrder[]>**
- Returns all orders for a farm
- Sorted by order date (descending)

**getOrdersFromSupplier(supplierId: string): Observable<FeedOrder[]>**
- Returns all orders from a supplier

**createOrder(order: Partial<FeedOrder>): Observable<string>**

**updateOrder(orderId: string, updates: Partial<FeedOrder>): Observable<void>**

**deleteOrder(orderId: string): Observable<void>**

---

### Blacksmith Services

#### Blacksmith Data Service

**File:** `src/app/core/services/blacksmith-data.service.ts`
**Collection:** `blacksmiths`

**Methods:**
- `addBlacksmith(blacksmith: Blacksmith): Observable<DocumentReference>`
- `getAllBlacksmiths(): Observable<Blacksmith[]>`
- `getBlacksmith(id: string): Observable<Blacksmith>`
- `updateBlacksmith(id: string, updatedData: Partial<Blacksmith>): Observable<void>`
- `deleteBlacksmith(id: string): Observable<void>`

#### Blacksmith Service (Visits)

**File:** `src/app/core/services/blacksmith.service.ts`
**Collection:** `animals/{animalId}/blacksmithVisits`

**Methods:**
- `addVisitRecord(animalId: string, record: BlacksmithVisit): Observable<DocumentReference>`
- `getVisitsByAnimalId(animalId: string): Observable<BlacksmithVisit[]>`
- `getVisitRecord(animalId: string, recordId: string): Observable<BlacksmithVisit>`
- `updateVisitRecord(animalId: string, recordId: string, updatedRecord: Partial<BlacksmithVisit>): Observable<void>`
- `deleteVisitRecord(animalId: string, recordId: string): Observable<void>`

---

### Veterinarian Services

#### Veterinarian Data Service

**File:** `src/app/core/services/veterinarian-data.service.ts`
**Collection:** `veterinarians`

**Methods:**
- `addVeterinarian(veterinarian: Omit<Veterinarian, 'id'>): Observable<DocumentReference>`
- `getAllVeterinarians(): Observable<Veterinarian[]>`
- `getVeterinarian(id: string): Observable<Veterinarian>`
- `updateVeterinarian(id: string, veterinarian: Partial<Veterinarian>): Observable<void>`
- `deleteVeterinarian(id: string): Observable<void>`

#### Veterinarian Visit Service

**File:** `src/app/core/services/veterinarian-visit.service.ts`
**Collection:** `animals/{animalId}/veterinarianVisits`

**Methods:**
- `addVisitRecord(animalId: string, record: VeterinarianVisit): Observable<DocumentReference>`
- `getVisitsByAnimalId(animalId: string): Observable<VeterinarianVisit[]>`
- `getVisitRecord(animalId: string, recordId: string): Observable<VeterinarianVisit>`
- `updateVisitRecord(animalId: string, recordId: string, updatedRecord: Partial<VeterinarianVisit>): Observable<void>`
- `deleteVisitRecord(animalId: string, recordId: string): Observable<void>`

---

### Other Animal Record Services

All follow the same pattern as Health Service:

**Birthing Service** - `birthing.service.ts`
**Weaning Service** - `weaning.service.ts`
**Medication Service** - `medication.service.ts`

Each provides:
- addRecord()
- getRecordsByAnimalId()
- getRecord()
- updateRecord()
- deleteRecord()

---

### Auth Service

**File:** `src/app/core/services/auth.service.ts`

**Methods:**

**signUp(email: string, password: string): Observable<any>**
- Creates new user account
- Returns user credentials

**signIn(email: string, password: string): Observable<any>**
- Authenticates user
- Returns user credentials

**signOut(): Observable<void>**
- Signs out current user
- Clears session

**currentUser$: Observable<any>**
- Observable of current user
- Null when not authenticated

**Usage:**
```typescript
this.authService.signIn(email, password).subscribe({
  next: (user) => {
    this.router.navigate(['/']);
  },
  error: (error) => {
    console.error('Login failed:', error);
  }
});
```

---

## Common Patterns

### Error Handling

All services use consistent error handling:

```typescript
this.service.create(data).subscribe({
  next: (result) => {
    // Success handling
  },
  error: (error) => {
    console.error('Operation failed:', error);
    // Error handling
  }
});
```

### Loading States

Components typically manage loading states:

```typescript
isLoading = true;

this.service.getData().subscribe({
  next: (data) => {
    this.data = data;
    this.isLoading = false;
  },
  error: (error) => {
    this.isLoading = false;
  }
});
```

### Observable Streams with Async Pipe

Preferred pattern for templates:

```typescript
// Component
data$: Observable<Model[]>;

ngOnInit() {
  this.data$ = this.service.getAll();
}

// Template
<div *ngFor="let item of data$ | async">
```

---

## Firebase Firestore Integration

### Collection References

Services use Firebase modular SDK:

```typescript
import { collection, query, where, getDocs } from '@angular/fire/firestore';

const collectionRef = collection(this.firestore, 'animals');
const q = query(
  collectionRef,
  where('tenantId', '==', this.tenantId)
);
```

### Document Operations

**Create:**
```typescript
const docRef = await addDoc(collection(firestore, 'collection'), data);
```

**Read:**
```typescript
const docSnap = await getDoc(doc(firestore, 'collection', id));
```

**Update:**
```typescript
await updateDoc(doc(firestore, 'collection', id), updates);
```

**Delete:**
```typescript
await deleteDoc(doc(firestore, 'collection', id));
```

### Query Patterns

**Filter by tenant:**
```typescript
where('tenantId', '==', tenantId)
```

**Filter by status:**
```typescript
where('isActive', '==', true)
```

**Sort results:**
```typescript
orderBy('name', 'asc')
```

**Note:** Compound queries with multiple `where` clauses and `orderBy` require Firestore composite indexes.

---

## Multi-Tenancy

All services automatically filter data by current user's tenant ID:

```typescript
private getCurrentTenantId(): string {
  return this.auth.currentUser?.uid || 'default-tenant';
}

getAllRecords(): Observable<Record[]> {
  const tenantId = this.getCurrentTenantId();
  const q = query(
    this.collection,
    where('tenantId', '==', tenantId)
  );
  // ...
}
```

This ensures data isolation between different farm operations.

---

## Service Testing

### Unit Testing (Planned)

Services should be unit tested with:
- Mock Firestore
- Mock Auth
- Test data fixtures

**Example:**
```typescript
describe('AnimalsService', () => {
  let service: AnimalsService;
  let mockFirestore: jasmine.SpyObj<Firestore>;

  beforeEach(() => {
    mockFirestore = jasmine.createSpyObj('Firestore', ['collection']);
    service = new AnimalsService(mockFirestore, mockAuth);
  });

  it('should retrieve all animals for tenant', (done) => {
    service.getAll().subscribe(animals => {
      expect(animals.length).toBeGreaterThan(0);
      done();
    });
  });
});
```

---

## Performance Considerations

### Query Optimization

1. **Index Required Fields** - Ensure Firestore has indexes for common queries
2. **Limit Results** - Add pagination for large datasets (planned)
3. **Denormalize Data** - Store frequently accessed data to reduce joins
4. **Cache Results** - Implement service-level caching (planned)

### Observable Management

1. **Unsubscribe** - Use async pipe or manually unsubscribe
2. **Share Operators** - Use `shareReplay()` for expensive operations
3. **Debounce** - Use `debounceTime()` for search/filter operations

---

## Future Enhancements

### Phase 2 API Improvements

1. **Pagination** - Add limit/offset support
2. **Search** - Full-text search capabilities
3. **Batch Operations** - Efficient bulk updates
4. **Caching** - Service-level and browser caching
5. **Offline Support** - PWA offline data access
6. **Cloud Functions** - Complex operations moved to backend
7. **Real-time Updates** - Firestore snapshot listeners
8. **File Upload** - Image/document attachment support

---

**Last Updated:** November 2024
**Version:** 1.0.0 (MVP)
