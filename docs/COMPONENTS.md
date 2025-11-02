# Components Documentation

Complete UI component structure and hierarchy for the Farm Animal Tracker (FAT App).

---

## Component Organization

Components are organized by feature modules within the `src/app/features` directory. Each feature follows a consistent pattern:
- List/View component
- Add component
- Edit component

---

## Core Components

### Home Component

**Path:** `src/app/home/home.component.ts`
**Route:** `/`
**Protected:** Yes (AuthGuard)

**Purpose:** Main landing page after login, displays animal list.

**Features:**
- Lists all animals for the tenant
- Quick access to add/edit animals
- Logout functionality
- Navigation to animal detail view

### Login Component

**Path:** `src/app/auth/login/login.component.ts`
**Route:** `/login`
**Protected:** No

**Purpose:** User authentication

**Features:**
- Email/password login form
- Firebase Authentication integration
- Error handling
- Redirect to home on success

### Signup Component

**Path:** `src/app/auth/signup/signup.component.ts`
**Route:** `/signup`
**Protected:** No

**Purpose:** New user registration

**Features:**
- Email/password registration
- Form validation
- Firebase Authentication integration
- Redirect to login on success

### User Profile Component

**Path:** `src/app/user-profile/user-profile.component.ts`
**Route:** `/profile`
**Protected:** Yes (AuthGuard)

**Purpose:** User profile management

**Features:**
- Display user information
- Edit profile details
- Password change (planned)

---

## Animal Management Components

### Animals Component (List)

**Path:** `src/app/features/animals/components/animals/animal-details.component.ts`
**Route:** Embedded in HomeComponent
**Protected:** Yes (AuthGuard)

**Purpose:** Display all animals in a list/grid view

**Features:**
- List all animals for tenant
- Delete animal functionality
- Navigate to add/edit views
- Search and filter (planned)
- TrackBy optimization

**Key Methods:**
```typescript
trackByAnimalId(index: number, animal: Animal): string
onDelete(animal: Animal): void
```

### Add Animal Component

**Path:** `src/app/features/animals/components/add-animal/add-animal.component.ts`
**Route:** `/add-animal`
**Protected:** Yes (AuthGuard)

**Purpose:** Create new animal record

**Form Fields:**
- Name/Tag
- Species
- Breed
- Identifier
- Date of Birth
- Sex
- Status

### Edit Animal Component

**Path:** `src/app/features/animals/components/edit-animal/edit-animal.component.ts`
**Route:** `/edit-animal/:id`
**Protected:** Yes (AuthGuard)

**Purpose:** Edit existing animal record and navigation hub

**Features:**
- Update animal information
- Hub for accessing all animal-related modules
- Navigation to health records, breeding, birthing, etc.
- Responsive form layout

**Navigation Links:**
- Health Records
- Breeding Events
- Hormone Management
- Pregnancy Checks
- Birthing Schedules
- Weaning Schedules
- Blacksmith Visits
- Medication/Treatments

---

## Health Records Module

### Health Component (List)

**Path:** `src/app/features/healthRecords/components/health/health.component.ts`
**Route:** `/animals/:id/health`

**Purpose:** Display all health records for an animal

**Features:**
- List health events
- Show animal name (not ID)
- Add/edit/delete records
- Mobile-responsive grid layout

**Display Fields:**
- Date
- Event Type
- Description
- Dosage
- Actions (Edit/Delete)

### Add Health Component

**Path:** `src/app/features/healthRecords/components/add-health/add-health.component.ts`
**Route:** `/animals/:id/add-health`

**Form Fields:**
- Date (required)
- Event Type (required)
- Description (optional)
- Administered By (required)
- Dosage (optional)

### Edit Health Component

**Path:** `src/app/features/healthRecords/components/edit-health/edit-health.component.ts`
**Route:** `/animals/:id/health/edit/:recordId`

**Features:**
- Pre-populated form
- Loading state
- Reactive forms (FormGroup)
- Form validation

---

## Breeding Event Module

### Breeding Event Component (List)

**Path:** `src/app/features/breedingEvent/components/breedingEvent/breedingEvent.component.ts`
**Route:** `/animals/:id/breeding`

**Purpose:** Track breeding events for an animal

**Features:**
- List all breeding events
- Navigate to nested pregnancy checks
- Navigate to nested hormone treatments
- Add/edit/delete functionality

### Add Breeding Component

**Path:** `src/app/features/breedingEvent/components/add-breeding/add-breeding.component.ts`
**Route:** `/animals/:id/breeding/add`

**Form Fields:**
- Date
- Event Type ('Heat Detected', 'Breeding', etc.)
- Associated Animal (Bull/Stallion)
- Notes

### Edit Breeding Component

**Path:** `src/app/features/breedingEvent/components/edit-breeding/edit-breeding.component.ts`
**Route:** `/animals/:id/breeding/edit/:eventId`

### Pregnancy Check Component (List)

**Path:** `src/app/features/breedingEvent/components/pregnancy-check/pregnancy-check.component.ts`
**Route:** `/animals/:id/breeding/:eventId/checks`

**Purpose:** Track pregnancy confirmation checks (nested under breeding events)

**Features:**
- List all pregnancy checks for a breeding event
- Navigate back to breeding events
- Add/edit/delete checks

### Add Pregnancy Check Component

**Path:** `src/app/features/breedingEvent/components/add-pregnancy-check/add-pregnancy-check.component.ts`
**Route:** `/animals/:id/breeding/:eventId/checks/add`

**Form Fields:**
- Check Date
- Result ('Pregnant', 'Open', 'Recheck Required')
- Confirmation Method ('Ultrasound', 'Blood Test', etc.)
- Next Check Date
- Notes

### Edit Pregnancy Check Component

**Path:** `src/app/features/breedingEvent/components/edit-pregnancy-check/edit-pregnancy-check.component.ts`
**Route:** `/animals/:id/breeding/:eventId/checks/edit/:checkId`

### Hormone Treatment List Component

**Path:** `src/app/features/breedingEvent/components/hormone-treatment-list/hormone-treatment-list.component.ts`
**Route:** `/animals/:id/breeding/:eventId/treatments`

**Purpose:** Track hormone treatments (nested under breeding events)

### Add Hormone Treatment Component

**Path:** `src/app/features/breedingEvent/components/add-hormone-treatment/add-hormone-treatment.component.ts`
**Route:** `/animals/:id/breeding/:eventId/treatments/add`

**Form Fields:**
- Treatment Date
- Hormone Type
- Product Used
- Dosage
- Administered By
- Notes

### Edit Hormone Treatment Component

**Path:** `src/app/features/breedingEvent/components/edit-hormone-treatment/edit-hormone-treatment.component.ts`
**Route:** `/animals/:id/breeding/:eventId/treatments/edit/:treatmentId`

---

## Birthing Module

### Birthing Schedule Component (List)

**Path:** `src/app/features/birthing/components/birthing-schedule/birthing-schedule.component.ts`
**Route:** `/animals/:id/birthing`

**Purpose:** Track birthing events and offspring details

**Features:**
- List all birthing records
- Mobile-responsive layout
- Add/edit/delete functionality

**Display Fields:**
- Date of Birth
- Offspring Tag/ID
- Sex
- Birth Weight
- Calving Ease
- Actions

### Add Birthing Schedule Component

**Path:** `src/app/features/birthing/components/add-birthing-schedule/add-birthing-schedule.component.ts`
**Route:** `/animals/:id/birthing/add`

**Form Fields:**
- Date of Birth
- Tag Info
- Dam (Mother)
- Sire (Father)
- Sex
- Birth Weight
- Breed
- Species
- Calving Ease
- Notes

### Edit Birthing Schedule Component

**Path:** `src/app/features/birthing/components/edit-birthing-schedule/edit-birthing-schedule.component.ts`
**Route:** `/animals/:id/birthing/edit/:recordId`

---

## Weaning Module

### Weaning Schedule Component (List)

**Path:** `src/app/features/weaning/components/weaning-schedule/weaning-schedule.component.ts`
**Route:** `/animals/:id/weaning`

**Purpose:** Track weaning schedules and methods

### Add Weaning Schedule Component

**Path:** `src/app/features/weaning/components/add-weaning-schedule/add-weaning-schedule.component.ts`
**Route:** `/animals/:id/weaning/add`

**Form Fields:**
- Wean Date
- Method ('Abrupt', 'Fence-line', 'Two-stage', etc.)
- Notes

### Edit Weaning Schedule Component

**Path:** `src/app/features/weaning/components/edit-weaning-schedule/edit-weaning-schedule.component.ts`
**Route:** `/animals/:id/weaning/edit/:recordId`

---

## Blacksmith Visit Module

### Blacksmith Visit Component (List)

**Path:** `src/app/features/blacksmith/components/blacksmith-visit/blacksmith-visit.component.ts`
**Route:** `/animals/:id/blacksmith`

**Purpose:** Track farrier visits and hoof care

**Display Fields:**
- Visit Date
- Service Provided
- Provider
- Next Appointment
- Actions

### Add Blacksmith Visit Component

**Path:** `src/app/features/blacksmith/components/add-blacksmith-visit/add-blacksmith-visit.component.ts`
**Route:** `/animals/:id/blacksmith/add`

**Form Fields:**
- Visit Date
- Service Provided
- Next Appointment Date
- Provider (dropdown from blacksmith list)
- Notes

### Edit Blacksmith Visit Component

**Path:** `src/app/features/blacksmith/components/edit-blacksmith-visit/edit-blacksmith-visit.component.ts`
**Route:** `/animals/:id/blacksmith/edit/:recordId`

---

## Veterinarian Visit Module

### Veterinarian Visit Component (List)

**Path:** `src/app/features/veterinarian-visit/components/veterinarian-visit/veterinarian-visit.component.ts`
**Route:** `/animals/:id/veterinarian-visit`

**Purpose:** Track veterinarian appointments and treatments

**Display Fields:**
- Visit Date
- Veterinarian
- Visit Type
- Diagnosis
- Treatment
- Actions

### Add Veterinarian Visit Component

**Path:** `src/app/features/veterinarian-visit/components/add-veterinarian-visit/add-veterinarian-visit.component.ts`
**Route:** `/animals/:id/veterinarian-visit/add`

**Form Fields:**
- Visit Date
- Veterinarian (dropdown)
- Visit Type (dropdown with options)
- Diagnosis
- Treatment Provided
- Medications Administered
- Next Appointment Date
- Notes

### Edit Veterinarian Visit Component

**Path:** `src/app/features/veterinarian-visit/components/edit-veterinarian-visit/edit-veterinarian-visit.component.ts`
**Route:** `/animals/:id/veterinarian-visit/edit/:recordId`

**Features:**
- Pre-populated form with existing data
- Loading state while fetching record
- Veterinarian dropdown populated from collection

---

## Medication Record Module

### Medication Record List Component

**Path:** `src/app/features/medication-record/components/medication-record-list/medication-record-list.component.ts`
**Route:** `/animals/:id/medication-record`

**Purpose:** Track medication administration

### Add Medication Record Component

**Path:** `src/app/features/medication-record/components/add-medication-record/add-medication-record.component.ts`
**Route:** `/animals/:id/medication-record/add`

**Form Fields:**
- Visit Date
- Provider
- Treatment Type
- Medication Name
- Dosage
- Notes

### Edit Medication Record Component

**Path:** `src/app/features/medication-record/components/edit-medication-record/edit-medication-record.component.ts`
**Route:** `/animals/:id/medication-record/edit/:recordId`

---

## Farm Management Module

### Farm List Component

**Path:** `src/app/features/farms/component/farm-list.component/farm-list.component.ts`
**Route:** `/farms`
**Protected:** Yes (AuthGuard)

**Purpose:** Manage farm locations

**Features:**
- List all farms with facilities
- Card-based layout (mobile) → Grid layout (desktop)
- Shows animal count per farm
- Add/edit/delete functionality

**Display Information:**
- Farm name
- Location (city, state)
- Acreage
- Current animal count
- Facilities (icons/badges)
- Actions

**Helper Methods:**
```typescript
hasFacilities(farm: Farm): boolean
trackByFarmId(index: number, farm: Farm): string
```

### Farm Add Component

**Path:** `src/app/features/farms/component/farm-add.component/farm-add.component.ts`
**Route:** `/farms/add`
**Protected:** Yes (AuthGuard)

**Form Sections:**
1. **Basic Information**
   - Name
   - Acreage

2. **Address**
   - Street
   - City
   - State
   - Zip Code

3. **Facilities** (Checkboxes)
   - Barn
   - Hay Storage Capacity
   - Cattle Chute
   - Loading Ramp
   - Water Source
   - Shelter

### Farm Edit Component

**Path:** `src/app/features/farms/component/farm-edit.component/farm-edit.component.ts`
**Route:** `/farms/edit/:id`
**Protected:** Yes (AuthGuard)

**Features:**
- Pre-populated form
- Loading state
- Same form structure as add component
- Shows farm name in subtitle

---

## Admin Modules

### Providers Dashboard Component

**Path:** `src/app/features/admin/providers/components/providers/providers.component.ts`
**Route:** `/admin/providers`
**Protected:** Yes (AuthGuard)

**Purpose:** Unified dashboard for all service providers

**Features:**
- Card-based navigation
- Links to each provider type
- Status indicators (Active/Placeholder)

**Provider Types:**
- Blacksmiths
- Veterinarians
- Feed Suppliers
- Farms

### Blacksmith Admin Component

**Path:** `src/app/features/admin/blacksmith/components/blacksmith-admin/blacksmith-admin.component.ts`
**Route:** `/admin/blacksmiths`
**Protected:** Yes (AuthGuard)

**Purpose:** Manage blacksmith provider directory

**Features:**
- List all blacksmiths
- Grid layout (Name, Phone, Specialty, Actions)
- Add/edit/delete functionality

### Add Blacksmith Component

**Path:** `src/app/features/admin/blacksmith/components/add-blacksmith/add-blacksmith.component.ts`
**Route:** `/admin/blacksmiths/add`
**Protected:** Yes (AuthGuard)

**Form Fields:**
- Name
- Phone
- Specialty

### Edit Blacksmith Component

**Path:** `src/app/features/admin/blacksmith/components/edit-blacksmith/edit-blacksmith.component.ts`
**Route:** `/admin/blacksmiths/edit/:blacksmithId`
**Protected:** Yes (AuthGuard)

### Veterinarian Admin Component

**Path:** `src/app/features/admin/veterinarian/components/veterinarian-admin/veterinarian-admin.component.ts`
**Route:** `/admin/veterinarian`
**Protected:** Yes (AuthGuard)

**Purpose:** Manage veterinarian provider directory

**Features:**
- List all veterinarians
- Grid layout (Name, Clinic, Specialty, Phone, Actions)
- Add/edit/delete functionality

### Add Veterinarian Component

**Path:** `src/app/features/admin/veterinarian/components/add-veterinarian/add-veterinarian.component.ts`
**Route:** `/admin/veterinarian/add`
**Protected:** Yes (AuthGuard)

**Form Fields:**
- Name
- Phone
- Email
- Clinic
- Specialty
- Notes

### Edit Veterinarian Component

**Path:** `src/app/features/admin/veterinarian/components/edit-veterinarian/edit-veterinarian.component.ts`
**Route:** `/admin/veterinarian/edit/:recordId`
**Protected:** Yes (AuthGuard)

### Feed Supplier Component (List)

**Path:** `src/app/features/admin/feedSupplier/component/feed-supplier.component/feed-supplier.component.ts`
**Route:** `/admin/feed-suppliers`
**Protected:** Yes (AuthGuard)

**Purpose:** Manage feed supplier directory

**Features:**
- List all feed suppliers
- 5-column grid (Name, Contact, Phone, Products, Actions)
- Add/edit/delete functionality

### Add Feed Supplier Component

**Path:** `src/app/features/admin/feedSupplier/component/add-feed-supplier.component/add-feed-supplier.component.ts`
**Route:** `/admin/feed-suppliers/add`
**Protected:** Yes (AuthGuard)

**Form Sections:**
1. **Basic Information**
   - Name

2. **Contact Information**
   - Contact Person
   - Phone
   - Email
   - Alternate Phone

3. **Address**
   - Street
   - City
   - State
   - Zip Code

4. **Products Offered** (Checkbox Grid)
   - 15 common feed products
   - Responsive: 1 col (mobile) → 2 cols (tablet) → 3 cols (desktop)

5. **Delivery Information**
   - Delivery Available (checkbox)
   - Minimum Order
   - Notes

### Edit Feed Supplier Component

**Path:** `src/app/features/admin/feedSupplier/component/edit-feed-supplier.component/edit-feed-supplier.component.ts`
**Route:** `/admin/feed-suppliers/edit/:id`
**Protected:** Yes (AuthGuard)

**Features:**
- Pre-populated form
- Loading state
- Checkbox grid pre-selected based on existing products

---

## Common Component Patterns

### List Components

**Common Features:**
- Observable data streams with async pipe
- TrackBy functions for performance
- Empty states
- Loading states (some components)
- Delete confirmation dialogs
- Mobile-responsive layouts

**Typical Structure:**
```typescript
export class ListComponent implements OnInit {
  data$!: Observable<Model[]>;

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    this.data$ = this.service.getAll();
  }

  trackById(index: number, item: Model): string {
    return item.id!;
  }

  onDelete(id: string): void {
    if (confirm('Are you sure?')) {
      this.service.delete(id).subscribe(() => {
        this.loadData(); // Refresh
      });
    }
  }
}
```

### Add Components

**Common Features:**
- Template-driven or Reactive forms
- Form validation
- Navigation on success
- Cancel button

**Typical Structure:**
```typescript
export class AddComponent implements OnInit {
  model: Partial<Model> = {};

  onSubmit(form: NgForm): void {
    if (form.invalid) return;

    this.service.create(this.model).subscribe({
      next: () => {
        this.router.navigate(['/list']);
      },
      error: (error) => {
        console.error('Error:', error);
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['/list']);
  }
}
```

### Edit Components

**Common Features:**
- Load existing data on init
- Pre-populate form
- Loading states
- Form validation
- Navigation on success/cancel

**Typical Structure:**
```typescript
export class EditComponent implements OnInit {
  id!: string;
  model: Partial<Model> = {};
  isLoading = true;

  ngOnInit(): void {
    this.id = this.route.snapshot.paramMap.get('id')!;
    this.loadData();
  }

  loadData(): void {
    this.service.getById(this.id).subscribe({
      next: (data) => {
        this.model = data;
        this.isLoading = false;
      }
    });
  }

  onSubmit(form: NgForm): void {
    if (form.invalid) return;

    this.service.update(this.id, this.model).subscribe({
      next: () => {
        this.router.navigate(['/list']);
      }
    });
  }
}
```

---

## Styling Patterns

### Mobile-First SCSS

All components use mobile-first responsive design:

```scss
// Variables
$breakpoint-md: 768px;
$breakpoint-lg: 1024px;

// Mobile (default)
.component {
  padding: 1rem;

  @media (min-width: $breakpoint-md) {
    padding: 1.5rem; // Tablet
  }

  @media (min-width: $breakpoint-lg) {
    padding: 2rem; // Desktop
  }
}
```

### Common Style Components

1. **Page Container** - Max-width wrapper with padding
2. **Header Bar** - Title + action buttons
3. **Form Card** - White background, border, shadow
4. **Grid Layouts** - Responsive grids for lists
5. **Empty States** - Centered messages with icons
6. **Loading States** - Spinner with message

---

## Component Communication

### Parent → Child

Using `@Input()`:
```typescript
@Input() animalId!: string;
```

### Child → Parent

Using `@Output()` with EventEmitter:
```typescript
@Output() deleted = new EventEmitter<string>();
```

### Service-based Communication

Using shared services with BehaviorSubject:
```typescript
private dataSubject = new BehaviorSubject<Data[]>([]);
data$ = this.dataSubject.asObservable();
```

---

**Last Updated:** November 2024
**Version:** 1.0.0 (MVP)
