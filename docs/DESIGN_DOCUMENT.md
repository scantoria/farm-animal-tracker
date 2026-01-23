# Farm Animal Tracker - System Design Document

**Version:** 1.0
**Last Updated:** January 10, 2026
**Status:** Production

---

## 1. Executive Summary

This document describes the system architecture, design patterns, data models, and technical implementation of the Farm Animal Tracker application. The system is built using Angular 20.2 standalone components with Firebase backend services, implementing a multi-tenant SaaS architecture for farm animal management.

---

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer (Angular 20.2)              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Standalone Components (51+ components)               │  │
│  │  - Feature Modules (12 domains)                       │  │
│  │  - Shared Components & Utilities                      │  │
│  └───────────────────────────────────────────────────────┘  │
│                            ↓↑                                │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Service Layer (20 core services)                     │  │
│  │  - Business Logic                                     │  │
│  │  - State Management (RxJS)                            │  │
│  │  - Firebase Integration                               │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            ↓↑
┌─────────────────────────────────────────────────────────────┐
│                  Firebase Platform (Backend)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Firebase Auth│  │  Firestore   │  │Cloud Storage │      │
│  │  (Users &    │  │  (NoSQL DB)  │  │  (Files)     │      │
│  │  Sessions)   │  │              │  │              │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓↑
┌─────────────────────────────────────────────────────────────┐
│              Firebase Hosting (Static Assets)                │
│              https://farmanimaltracker.web.app               │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Technology Stack

#### Frontend
- **Framework:** Angular 20.2.0
- **Language:** TypeScript 5.9.2
- **Architecture:** Standalone Components (no NgModules)
- **State Management:** RxJS 7.8.0 (Observable-based)
- **Styling:** SCSS (Sass preprocessor)
- **Routing:** Angular Router with guards
- **Forms:** Template-driven forms with NgForm
- **HTTP:** Angular Fire integration
- **Rendering:** Angular SSR (Server-Side Rendering) configured

#### Backend Services
- **Authentication:** Firebase Auth (email/password)
- **Database:** Cloud Firestore (NoSQL)
- **Storage:** Firebase Cloud Storage
- **Hosting:** Firebase Hosting

#### Development Tools
- **Build Tool:** Angular CLI 20.2.0
- **Package Manager:** npm
- **Code Formatting:** Prettier (100 char width, single quotes)
- **Testing:** Jasmine/Karma (configured, tests skipped)

### 2.3 Deployment Architecture

```
Developer Workstation
        ↓
   ng build (production)
        ↓
  Firebase Deploy
        ↓
┌─────────────────────────┐
│  Firebase Hosting CDN   │
│  (Global distribution)  │
└─────────────────────────┘
        ↓
    End Users
```

---

## 3. Application Architecture

### 3.1 Directory Structure

```
src/app/
├── auth/                           # Authentication module
│   ├── login/
│   │   └── login.component.ts
│   ├── signup/
│   │   └── signup.component.ts     # Deprecated/removed
│   ├── invite-user/
│   │   └── invite-user.component.ts
│   ├── auth.guard.ts               # Route protection
│   └── admin-invite.guard.ts       # Admin-only invite protection
│
├── core/                           # Core singleton services
│   ├── services/
│   │   ├── auth.service.ts
│   │   ├── animals.service.ts
│   │   ├── health.service.ts
│   │   ├── breeding.service.ts
│   │   ├── birthing.service.ts
│   │   ├── weaning.service.ts
│   │   ├── medication.service.ts
│   │   ├── blacksmith.service.ts
│   │   ├── blacksmith-data.service.ts
│   │   ├── veterinarian-visit.service.ts
│   │   ├── veterinarian-data.service.ts
│   │   ├── sire.service.ts
│   │   ├── farm.service.ts
│   │   ├── farm-data.service.ts
│   │   ├── feed-supplier.service.ts
│   │   ├── user-data.service.ts
│   │   ├── document.service.ts
│   │   ├── movement-records.service.ts
│   │   ├── pregnancy-data.service.ts
│   │   └── confirm.service.ts
│   ├── facades/
│   └── guards/
│
├── features/                       # Domain-organized feature modules
│   ├── animals/                    # Core animal management
│   │   ├── components/
│   │   │   ├── animal-form/
│   │   │   ├── animal-list/
│   │   │   └── animal-details/
│   │   └── pages/
│   │
│   ├── admin/                      # Admin features
│   │   ├── blacksmiths/
│   │   ├── veterinarian/
│   │   ├── feed-suppliers/
│   │   ├── sires/
│   │   ├── invite-user/
│   │   └── providers/
│   │
│   ├── healthRecords/              # Health tracking
│   │   └── components/
│   │       ├── add-health/
│   │       ├── edit-health/
│   │       └── health-list/
│   │
│   ├── breedingEvent/              # Breeding management
│   │   └── components/
│   │       ├── add-breeding/
│   │       ├── edit-breeding/
│   │       ├── breeding-list/
│   │       ├── add-pregnancy-check/
│   │       ├── edit-pregnancy-check/
│   │       ├── pregnancy-check-list/
│   │       ├── add-hormone-treatment/
│   │       ├── edit-hormone-treatment/
│   │       └── hormone-treatment-list/
│   │
│   ├── birthing/                   # Birthing schedules
│   │   └── components/
│   │       ├── add-birthing-schedule/
│   │       ├── edit-birthing-schedule/
│   │       └── birthing-list/
│   │
│   ├── weaning/                    # Weaning schedules
│   │   └── components/
│   │       ├── add-weaning-schedule/
│   │       ├── edit-weaning-schedule/
│   │       └── weaning-list/
│   │
│   ├── medication-record/          # Medication tracking
│   │   └── components/
│   │       ├── add-medication-record/
│   │       ├── edit-medication-record/
│   │       └── medication-record-list/
│   │
│   ├── veterinarian-visit/         # Vet visit tracking
│   │   └── components/
│   │       ├── add-veterinarian-visit/
│   │       ├── edit-veterinarian-visit/
│   │       └── veterinarian-visit-list/
│   │
│   ├── blacksmith/                 # Blacksmith services
│   │   └── components/
│   │       ├── add-blacksmith-visit/
│   │       ├── edit-blacksmith-visit/
│   │       └── blacksmith-visit-list/
│   │
│   ├── farms/                      # Farm management
│   │   └── components/
│   │       ├── farm-list/
│   │       ├── add-farm/
│   │       ├── edit-farm/
│   │       ├── farm-details/
│   │       └── assign-animals/
│   │
│   └── providers/                  # Provider dashboard
│       └── components/
│
├── shared/                         # Shared resources
│   ├── components/
│   │   ├── header/
│   │   ├── footer/
│   │   └── loading-spinner/
│   ├── models/                     # TypeScript interfaces (30+)
│   │   ├── animal.model.ts
│   │   ├── health.model.ts
│   │   ├── breeding.model.ts
│   │   ├── farm.model.ts
│   │   └── ... (25+ more)
│   ├── pipes/
│   │   └── date-format.pipe.ts
│   ├── directives/
│   └── utils/
│       ├── gestation-calculator.ts
│       └── date-utils.ts
│
├── home/                           # Home dashboard
│   └── home.component.ts
│
├── user-profile/                   # User profile
│   └── user-profile.component.ts
│
├── app.component.ts                # Root component
├── app.config.ts                   # Application configuration
└── app.routes.ts                   # Route definitions
```

### 3.2 Component Architecture

#### Standalone Component Pattern
All components use Angular's standalone architecture:

```typescript
@Component({
  selector: 'app-example',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    // Other dependencies
  ],
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.scss']
})
export class ExampleComponent {
  // Component logic
}
```

**Benefits:**
- No NgModules required
- Clearer dependency graph
- Better tree-shaking
- Simplified testing
- Improved code organization

#### Component Naming Conventions
- **List Components:** `{feature}-list.component.ts` or `{feature}.component.ts`
- **Add Forms:** `add-{feature}.component.ts`
- **Edit Forms:** `edit-{feature}.component.ts`
- **Detail Views:** `{feature}-details.component.ts`

---

## 4. Design Patterns

### 4.1 Service Layer Pattern

All business logic is encapsulated in singleton services with `providedIn: 'root'`:

```typescript
@Injectable({
  providedIn: 'root'
})
export class AnimalsService {
  private firestore = inject(Firestore);

  // Observable-based API
  getAnimals(tenantId: string): Observable<Animal[]> {
    // Firebase integration
  }

  // Promise-wrapped in Observable
  addAnimal(animal: Animal): Observable<string> {
    return from(/* Firebase operation */);
  }
}
```

**Key Services:**
1. **auth.service.ts** - Authentication, user session management
2. **animals.service.ts** - Animal CRUD, lineage tracking, bloodline queries
3. **breeding.service.ts** - Breeding events with nested subcollections
4. **farm.service.ts** - Farm management, animal transfers
5. **document.service.ts** - File upload/download, storage management

### 4.2 Facade Pattern

Facades simplify complex service interactions:

```typescript
@Injectable({
  providedIn: 'root'
})
export class AnimalFacade {
  constructor(
    private animalsService: AnimalsService,
    private breedingService: BreedingService,
    private healthService: HealthService
  ) {}

  // Simplified API for components
  getAnimalWithHistory(id: string): Observable<AnimalWithHistory> {
    // Combines multiple service calls
  }
}
```

### 4.3 Guard Pattern

Route protection using Angular guards:

```typescript
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.currentUser$.pipe(
    map(user => {
      if (user) return true;
      router.navigate(['/login']);
      return false;
    })
  );
};
```

**Guards Implemented:**
- `authGuard` - Protects all routes except `/login`
- `adminInviteGuard` - Restricts invite feature to authorized admins

### 4.4 Observable Pattern (Reactive Programming)

All async operations use RxJS Observables:

```typescript
// Component
export class AnimalListComponent implements OnInit {
  animals$!: Observable<Animal[]>;

  ngOnInit() {
    this.animals$ = this.animalsService.getAnimals(this.tenantId);
  }
}
```

```html
<!-- Template with async pipe -->
<div *ngFor="let animal of animals$ | async">
  {{ animal.name }}
</div>
```

**Benefits:**
- Automatic subscription management
- Memory leak prevention
- Composable data streams
- Built-in operators for transformation

### 4.5 Repository Pattern

Services act as repositories for Firestore collections:

```typescript
@Injectable({ providedIn: 'root' })
export class HealthService {
  private readonly COLLECTION = 'animals';

  // Get subcollection
  getHealthRecords(tenantId: string, animalId: string): Observable<HealthModel[]> {
    const healthRef = collection(
      this.firestore,
      `${this.COLLECTION}/${animalId}/healthRecords`
    );
    // Return Observable
  }

  // Add to subcollection
  addHealthRecord(animalId: string, record: HealthModel): Observable<string> {
    // Firestore operation
  }
}
```

---

## 5. Data Models

### 5.1 Core Data Model: Animal

```typescript
export interface Animal {
  id?: string;
  tenantId: string;              // Multi-tenant isolation
  name: string;
  species: AnimalSpecies;
  breed?: string;
  sex: 'male' | 'female';
  dateOfBirth: Date | Timestamp;
  earTag?: string;
  color?: string;
  weight?: number;
  purchaseDate?: Date | Timestamp;
  purchasePrice?: number;
  currentFarm?: string;          // Farm reference
  imageUrl?: string;             // Profile image
  status: AnimalStatus;          // Active, Sold, Deceased
  reproductiveStatus?: ReproductiveStatus;
  sireId?: string;               // Parent reference (internal or external)
  damId?: string;                // Parent reference
  createdAt?: Date | Timestamp;
  updatedAt?: Date | Timestamp;
}

export type AnimalSpecies =
  | 'Cattle'
  | 'Sheep'
  | 'Goats'
  | 'Pigs'
  | 'Horses'
  | 'Llamas'
  | 'Alpacas'
  | 'Donkeys'
  | 'Mules';

export type AnimalStatus = 'Active' | 'Sold' | 'Deceased';

export type ReproductiveStatus =
  | 'Open'      // Female, not pregnant
  | 'Pregnant'  // Female, confirmed pregnant
  | 'Intact'    // Male, not castrated
  | 'Castrated' // Male, castrated
  | 'Unknown';
```

### 5.2 Lineage Model

```typescript
export interface AnimalLineage {
  animal: Animal;
  sire?: ParentInfo;
  dam?: ParentInfo;
  paternalGrandSire?: ParentInfo;
  paternalGrandDam?: ParentInfo;
  maternalGrandSire?: ParentInfo;
  maternalGrandDam?: ParentInfo;
}

export interface ParentInfo {
  id: string;
  name: string;
  species: AnimalSpecies;
  breed?: string;
  isExternal: boolean;  // True if external sire
}
```

### 5.3 Health Records Model

```typescript
export interface HealthModel {
  id?: string;
  animalId: string;
  tenantId: string;
  eventDate: Date | Timestamp;
  healthEventType: HealthEventType;
  description?: string;
  treatment?: string;
  notes?: string;
  castration?: Castration;     // Nested object for castration details
  dehorning?: Dehorning;       // Nested object for dehorning details
  createdAt?: Date | Timestamp;
  updatedAt?: Date | Timestamp;
}

export type HealthEventType =
  | 'Hoof Trimming'
  | 'Vaccination'
  | 'General Checkup'
  | 'Injury Treatment'
  | 'Illness'
  | 'Castration'
  | 'Dehorning'
  | 'Other';

export interface Castration {
  method: 'Surgical' | 'Banding' | 'Burdizzo';
  ageAtCastration?: number;
  recoveryNotes?: string;
  complications?: string;
}

export interface Dehorning {
  method: 'Surgical' | 'Caustic Paste' | 'Hot Iron';
  ageAtDehorning?: number;
  recoveryNotes?: string;
  complications?: string;
}
```

### 5.4 Breeding Model (with nested structures)

```typescript
export interface BreedingEvent {
  id?: string;
  animalId: string;              // Dam (mother)
  tenantId: string;
  eventDate: Date | Timestamp;
  eventType: string;             // 'Heat Detected', 'Breeding', etc.
  sireId?: string;               // Internal animal or external sire
  notes?: string;
  createdAt?: Date | Timestamp;
  updatedAt?: Date | Timestamp;

  // Nested subcollections (managed separately):
  // - pregnancyChecks: PregnancyCheck[]
  // - hormoneTreatments: HormoneTreatment[]
}

export interface PregnancyCheck {
  id?: string;
  breedingEventId: string;
  animalId: string;
  tenantId: string;
  checkDate: Date | Timestamp;
  result: 'Pregnant' | 'Open' | 'Recheck Required';
  method?: 'Ultrasound' | 'Blood Test' | 'Palpation' | 'Visual';
  nextCheckDate?: Date | Timestamp;
  notes?: string;
  createdAt?: Date | Timestamp;
}

export interface HormoneTreatment {
  id?: string;
  breedingEventId: string;
  animalId: string;
  tenantId: string;
  treatmentDate: Date | Timestamp;
  treatmentType: 'Heat Synchronization' | 'Ovulation Induction';
  product?: string;
  dosage?: string;
  administrator?: string;
  notes?: string;
  createdAt?: Date | Timestamp;
}
```

### 5.5 Farm Model

```typescript
export interface Farm {
  id?: string;
  tenantId: string;
  name: string;
  address?: FarmAddress;
  acreage?: number;
  facilities?: FarmFacilities;
  status: 'active' | 'archived';
  createdAt?: Date | Timestamp;
  updatedAt?: Date | Timestamp;
}

export interface FarmAddress {
  street?: string;
  city?: string;
  state?: string;
  zipCode?: string;
}

export interface FarmFacilities {
  hasBarn?: boolean;
  hayStorageCapacity?: number;   // Round bales
  hasCattleChute?: boolean;
  hasLoadingRamp?: boolean;
  waterSource?: string;
  shelter?: string;
  notes?: string;
}

export interface FarmMovement {
  id?: string;
  animalId: string;
  tenantId: string;
  fromFarmId?: string;
  toFarmId: string;
  movementDate: Date | Timestamp;
  reason: MovementReason;
  movedBy?: string;
  notes?: string;
  createdAt?: Date | Timestamp;
}

export type MovementReason =
  | 'Winter Housing'
  | 'Summer Grazing'
  | 'Weaning'
  | 'Breeding'
  | 'Medical Treatment'
  | 'Sale Prep'
  | 'Quarantine'
  | 'Other';
```

### 5.6 External Sire Model

```typescript
export interface Sire {
  id?: string;
  tenantId: string;
  name: string;
  registrationNumber?: string;
  species: AnimalSpecies;
  breed?: string;
  bloodline?: {
    sireName?: string;
    damName?: string;
  };
  source: 'AI' | 'Leased' | 'Owned';
  provider?: string;             // AI company or owner name
  status: 'Active' | 'Inactive' | 'Retired';
  notes?: string;
  createdAt?: Date | Timestamp;
  updatedAt?: Date | Timestamp;
}

export interface SireWithStats extends Sire {
  breedingCount: number;         // Calculated field
}
```

### 5.7 Document Model

```typescript
export interface AnimalDocument {
  id?: string;
  animalId: string;
  tenantId: string;
  documentType: DocumentType;
  fileName: string;
  fileUrl: string;               // Firebase Storage URL
  fileSize: number;
  mimeType: string;
  uploadDate: Date | Timestamp;
  uploadedBy: string;
  notes?: string;
}

export type DocumentType =
  | 'Registration Papers'
  | 'Health Certificate'
  | 'Vaccination Record'
  | 'Purchase Receipt'
  | 'Insurance Document'
  | 'Pedigree Document'
  | 'Other';
```

### 5.8 User Model

```typescript
export interface User {
  uid: string;                   // Firebase Auth UID (also tenantId)
  email: string;
  displayName?: string;
  role: UserRole;
  createdAt?: Date | Timestamp;
  updatedAt?: Date | Timestamp;
}

export type UserRole = 'Admin' | 'User' | 'Viewer';
```

---

## 6. Database Schema (Firestore)

### 6.1 Collection Structure

```
firestore/
├── users/                                   # Top-level collection
│   └── {userId}/                            # Document per user
│       ├── uid: string
│       ├── email: string
│       ├── role: string
│       └── ...
│
├── animals/                                 # Top-level collection
│   └── {animalId}/                          # Document per animal
│       ├── id: string
│       ├── tenantId: string                 # Isolation key
│       ├── name: string
│       ├── species: string
│       ├── ... (animal fields)
│       │
│       ├── healthRecords/                   # Subcollection
│       │   └── {recordId}/
│       │       ├── healthEventType: string
│       │       └── ...
│       │
│       ├── breedingEvents/                  # Subcollection
│       │   └── {eventId}/
│       │       ├── eventDate: timestamp
│       │       ├── sireId: string
│       │       ├── ...
│       │       │
│       │       ├── pregnancyChecks/         # Nested subcollection
│       │       │   └── {checkId}/
│       │       │       ├── result: string
│       │       │       └── ...
│       │       │
│       │       └── hormoneTreatments/       # Nested subcollection
│       │           └── {treatmentId}/
│       │               └── ...
│       │
│       ├── birthingSchedules/               # Subcollection
│       │   └── {recordId}/
│       │
│       ├── weaningSchedules/                # Subcollection
│       │   └── {recordId}/
│       │
│       ├── medicationRecords/               # Subcollection
│       │   └── {recordId}/
│       │
│       ├── blacksmithVisits/                # Subcollection
│       │   └── {visitId}/
│       │
│       ├── veterinarianVisits/              # Subcollection
│       │   └── {visitId}/
│       │
│       └── documents/                       # Subcollection
│           └── {documentId}/
│
├── farms/                                   # Top-level collection
│   └── {farmId}/
│       ├── tenantId: string
│       ├── name: string
│       ├── ... (farm fields)
│       │
│       └── movements/                       # Subcollection
│           └── {movementId}/
│
├── sires/                                   # Top-level collection (external sires)
│   └── {sireId}/
│       ├── tenantId: string
│       └── ...
│
├── veterinarians/                           # Top-level collection
│   └── {vetId}/
│       ├── tenantId: string
│       └── ...
│
├── blacksmiths/                             # Top-level collection
│   └── {blacksmithId}/
│       ├── tenantId: string
│       └── ...
│
└── feedSuppliers/                           # Top-level collection
    └── {supplierId}/
        ├── tenantId: string
        └── ...
```

### 6.2 Multi-Tenancy Strategy

**Tenant Isolation:**
- Each document includes `tenantId` field
- `tenantId` = Firebase Auth UID of the user
- All queries filter by `tenantId`
- Firestore Security Rules enforce tenant isolation

**Security Rules Example:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /animals/{animalId} {
      allow read, write: if request.auth != null
                         && resource.data.tenantId == request.auth.uid;
    }
  }
}
```

### 6.3 Indexing Strategy

**Required Composite Indexes:**
1. `animals` collection:
   - `tenantId` ASC + `species` ASC + `name` ASC
   - `tenantId` ASC + `dateOfBirth` DESC
   - `tenantId` ASC + `status` ASC
   - `tenantId` ASC + `currentFarm` ASC

2. `farms` collection:
   - `tenantId` ASC + `status` ASC

3. `sires` collection:
   - `tenantId` ASC + `species` ASC + `status` ASC

---

## 7. State Management

### 7.1 Service-Based State

The application uses service-based state management without Redux/NgRx:

```typescript
@Injectable({ providedIn: 'root' })
export class AnimalsService {
  // Observable state
  private animalsSubject = new BehaviorSubject<Animal[]>([]);
  animals$ = this.animalsSubject.asObservable();

  // State update method
  private updateAnimals(animals: Animal[]) {
    this.animalsSubject.next(animals);
  }
}
```

### 7.2 Component State Patterns

**Smart (Container) Components:**
- Subscribe to service observables
- Handle user interactions
- Dispatch service calls
- Example: `AnimalListComponent`

**Dumb (Presentational) Components:**
- Accept inputs via `@Input()`
- Emit events via `@Output()`
- No service dependencies
- Pure presentation logic
- Example: `AnimalCardComponent`

---

## 8. Routing Architecture

### 8.1 Route Configuration

```typescript
export const routes: Routes = [
  { path: '', component: HomeComponent, canActivate: [authGuard] },
  { path: 'login', component: LoginComponent },

  // Animal routes
  { path: 'add-animal', component: AddAnimalComponent, canActivate: [authGuard] },
  { path: 'edit-animal/:id', component: EditAnimalComponent, canActivate: [authGuard] },

  // Feature routes (animal-specific)
  {
    path: 'animals/:id/health',
    component: HealthListComponent,
    canActivate: [authGuard]
  },
  {
    path: 'animals/:id/add-health',
    component: AddHealthComponent,
    canActivate: [authGuard]
  },

  // Nested breeding routes
  {
    path: 'animals/:id/breeding/:eventId/checks',
    component: PregnancyCheckListComponent,
    canActivate: [authGuard]
  },

  // Admin routes
  {
    path: 'admin/sires',
    component: SireListComponent,
    canActivate: [authGuard]
  },
  {
    path: 'admin/invite-user',
    component: InviteUserComponent,
    canActivate: [authGuard, adminInviteGuard]
  },

  // ... (50+ routes total)
];
```

### 8.2 Route Parameters

Common route parameters:
- `:id` - Animal ID (primary entity)
- `:recordId` - Generic record ID
- `:eventId` - Breeding event ID
- `:checkId` - Pregnancy check ID
- `:treatmentId` - Hormone treatment ID
- `:farmId` - Farm ID
- `:sireId` - Sire ID

### 8.3 Navigation Patterns

```typescript
// Programmatic navigation
this.router.navigate(['/animals', animalId, 'health']);

// Template navigation
<a [routerLink]="['/animals', animal.id, 'breeding']">View Breeding</a>

// Relative navigation
this.router.navigate(['../'], { relativeTo: this.route });
```

---

## 9. Security Architecture

### 9.1 Authentication Flow

```
User Login
    ↓
Firebase Auth (email/password)
    ↓
Auth Token (JWT)
    ↓
AuthService sets currentUser$
    ↓
AuthGuard allows route access
    ↓
Application loads
```

### 9.2 Authorization

**Role-Based Access Control (RBAC):**
- Implemented at service layer
- Admin role checked for sensitive operations
- AdminInviteGuard restricts invite feature by email

### 9.3 Data Security

**Multi-Tenant Isolation:**
- All queries filter by `tenantId`
- Firestore Security Rules enforce isolation
- No cross-tenant data access possible

**Input Validation:**
- Form validation before submission
- File type/size validation for uploads
- Data sanitization in services

---

## 10. Performance Optimization

### 10.1 Strategies

1. **Lazy Loading:** Route-level code splitting
2. **OnPush Change Detection:** For list components
3. **TrackBy Functions:** Optimize `*ngFor` rendering
4. **Async Pipe:** Automatic subscription management
5. **Firebase Query Optimization:** Indexed queries, limited reads
6. **Image Optimization:** Compressed profile images

### 10.2 Caching

- Firebase automatic caching for offline persistence
- Service-level BehaviorSubjects for state caching
- Component-level memoization for expensive calculations

---

## 11. Error Handling

### 11.1 Service Layer

```typescript
getAnimals(tenantId: string): Observable<Animal[]> {
  return from(/* Firebase query */).pipe(
    catchError(error => {
      console.error('Error fetching animals:', error);
      return throwError(() => new Error('Failed to fetch animals'));
    })
  );
}
```

### 11.2 Component Layer

```typescript
onSubmit() {
  this.service.addAnimal(this.animal).subscribe({
    next: (id) => {
      this.router.navigate(['/']);
    },
    error: (error) => {
      console.error('Error adding animal:', error);
      alert('Failed to add animal. Please try again.');
    }
  });
}
```

---

## 12. File Upload Architecture

### 12.1 Upload Flow

```
User selects file
    ↓
Client-side validation (type, size)
    ↓
DocumentService.uploadDocument()
    ↓
Firebase Storage upload (tenant-isolated path)
    ↓
Get download URL
    ↓
Save metadata to Firestore
    ↓
Return success
```

### 12.2 Storage Paths

```
storage/
└── {tenantId}/
    ├── animals/
    │   └── {animalId}/
    │       ├── profile-images/
    │       │   └── {fileName}
    │       └── documents/
    │           └── {documentType}/
    │               └── {fileName}
    └── farms/
        └── {farmId}/
            └── {fileName}
```

---

## 13. Testing Strategy

### 13.1 Unit Testing

- Framework: Jasmine + Karma
- Configuration: `skipTests: true` (tests optional)
- Coverage: Component logic, service methods

### 13.2 Integration Testing

- Firebase emulator for backend testing
- End-to-end user flows
- Multi-tenant isolation verification

---

## 14. Build & Deployment

### 14.1 Build Process

```bash
# Development build
ng serve

# Production build
ng build

# Production build with SSR
ng build && ng build:ssr
```

### 14.2 Deployment Process

```bash
# Build and deploy to Firebase Hosting
ng build && firebase deploy
```

**Deployment Configuration:**
- Firebase Hosting configuration in `firebase.json`
- Public directory: `dist/farm-animal-tracker/browser`
- Rewrites for Angular routing (SPA support)

---

## 15. Monitoring & Logging

### 15.1 Error Logging

- Console logging for development
- Firebase Analytics (future: error tracking)
- Client-side error boundary (Angular ErrorHandler)

### 15.2 Performance Monitoring

- Firebase Performance Monitoring (future enhancement)
- Lighthouse CI for build-time metrics
- Bundle size tracking

---

## 16. Scalability Considerations

### 16.1 Horizontal Scaling

- Serverless Firebase infrastructure
- Automatic scaling with user load
- Global CDN distribution via Firebase Hosting

### 16.2 Data Scaling

- Firestore subcollections for related data
- Paginated queries for large datasets (future enhancement)
- Efficient indexing strategy

### 16.3 Storage Scaling

- Firebase Cloud Storage auto-scaling
- File size limits enforced (10MB)
- Tenant isolation prevents cross-contamination

---

## 17. Architectural Decisions

### 17.1 Why Standalone Components?

- **Modern Angular:** Aligns with Angular 14+ direction
- **Simplicity:** No NgModule complexity
- **Tree-shaking:** Better production bundle sizes
- **Clarity:** Explicit dependency imports

### 17.2 Why Firebase?

- **Serverless:** No backend infrastructure management
- **Real-time:** Built-in real-time database capabilities
- **Authentication:** Turnkey auth solution
- **Scalability:** Auto-scaling with demand
- **Cost-effective:** Pay-as-you-go pricing

### 17.3 Why Template-Driven Forms?

- **Simplicity:** Easier for CRUD forms
- **Learning curve:** Lower barrier for team
- **Adequate:** Meets current validation needs

---

## 18. Future Architectural Enhancements

1. **NgRx/NGXS:** State management library for complex state
2. **Reactive Forms:** Advanced validation requirements
3. **GraphQL:** Optimized data fetching
4. **Progressive Web App:** Offline capabilities
5. **Microservices:** Backend service decomposition
6. **Containerization:** Docker for consistent environments

---

## 19. Glossary

- **Tenant:** Independent customer/user with isolated data
- **Subcollection:** Nested Firestore collection under a document
- **Observable:** RxJS stream of asynchronous data
- **Guard:** Angular route protection mechanism
- **SSR:** Server-Side Rendering for improved SEO/performance
- **Standalone Component:** Angular component without NgModule

---

**Document Control**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-10 | System Architect | Initial comprehensive design document |

---

End of Design Document
