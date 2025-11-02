# Architecture Documentation

## System Architecture Overview

The Farm Animal Tracker (FAT App) follows a modern web application architecture with Angular frontend and Firebase backend.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer (Angular)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Components  │  │   Services   │  │    Guards    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                   Firebase Platform                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Firestore DB │  │    Auth      │  │   Hosting    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## Frontend Architecture

### Angular Standalone Components

The application uses Angular 20.2's standalone components architecture, eliminating the need for NgModules:

**Benefits:**
- Simplified component structure
- Better tree-shaking
- Easier lazy loading
- Reduced boilerplate

### Component Structure

Components are organized by feature modules:

```
app/
├── auth/                    # Authentication
├── core/                    # Core services and guards
├── features/                # Feature modules
│   ├── animals/
│   ├── healthRecords/
│   ├── breedingEvent/
│   ├── birthing/
│   ├── weaning/
│   ├── blacksmith/
│   ├── veterinarian-visit/
│   ├── medication-record/
│   ├── farms/
│   └── admin/
├── shared/                  # Shared models and utilities
├── home/
└── user-profile/
```

###

 Routing Architecture

**Route Structure:**
- Flat routing for top-level features
- Nested routes for related resources
- Route guards for authentication
- Parameter-based routing for entity IDs

**Example:**
```
/animals/:id/health                              # List
/animals/:id/health/edit/:recordId               # Edit
/animals/:id/breeding/:eventId/checks            # Nested resource
```

---

## Backend Architecture

### Firebase Platform

**Firestore Database:**
- NoSQL document database
- Real-time synchronization
- Offline support
- Automatic scaling

**Authentication:**
- Email/password authentication
- User session management
- Role-based access control

**Hosting:**
- CDN-backed hosting
- SSL/TLS encryption
- Custom domain support
- Automatic scaling

---

## Data Architecture

### Multi-Tenancy

All data is isolated by tenant ID:

```typescript
interface BaseEntity {
  tenantId: string;  // User's UID from Firebase Auth
  // ... other fields
}
```

**Benefits:**
- Data isolation
- Security
- Scalability
- Support for multiple operations

### Hierarchical Data Structure

**Top-Level Collections:**
- `animals` - Main entity
- `farms` - Farm locations
- `blacksmiths` - Service providers
- `veterinarians` - Service providers
- `feedSuppliers` - Service providers
- `farmMovements` - Movement history
- `users` - User profiles

**Subcollections (under animals/{animalId}):**
- `healthRecords`
- `breedingEvents`
  - `pregnancyChecks` (nested)
  - `hormoneTreatments` (nested)
- `birthingSchedules`
- `weaningSchedules`
- `blacksmithVisits`
- `veterinarianVisits`
- `medicationRecords`

### Denormalization Strategy

To optimize read performance, frequently accessed data is denormalized:

**Example:**
```typescript
interface VeterinarianVisit {
  animalRef: DocumentReference;
  veterinarianRef: DocumentReference;
  veterinarianName: string;  // Denormalized
  // ...
}
```

**Benefits:**
- Faster queries
- Reduced read operations
- Better offline support

**Trade-offs:**
- Data duplication
- Update complexity
- Storage overhead

---

## Service Layer

### Service Architecture

```
Component → Service → Firestore
```

Each feature has dedicated services:

**Pattern:**
- **AnimalsService** - Animal CRUD
- **HealthService** - Health records
- **BreedingService** - Breeding events, pregnancy checks, hormone treatments
- **FarmService** - Farm management and movements
- **FeedSupplierService** - Supplier management and orders

### Observable Pattern

All services return RxJS Observables:

```typescript
getAllAnimals(): Observable<Animal[]>
getAnimal(id: string): Observable<Animal | undefined>
```

**Benefits:**
- Reactive programming
- Async pipe in templates
- Easy composition
- Built-in error handling

---

## Security Architecture

### Authentication Flow

```
1. User enters credentials
2. Firebase Auth validates
3. Token generated
4. Token stored in browser
5. AuthGuard validates on route navigation
6. Service layer includes token in requests
```

### Authorization

**Route Protection:**
```typescript
{
  path: 'admin/providers',
  component: ProvidersComponent,
  canActivate: [AuthGuard]
}
```

**Data Access:**
- Firestore security rules (to be implemented)
- Tenant ID filtering in all queries
- Document-level permissions

---

## State Management

### Component State

State is managed locally in components using:
- Component properties
- RxJS BehaviorSubjects
- Observable streams

**Example:**
```typescript
animals$: Observable<Animal[]>;

ngOnInit() {
  this.animals$ = this.animalsService.getAll();
}
```

### Service State

Services maintain minimal state:
- Current user (AuthService)
- Tenant ID
- Loading states

---

## Design Patterns

### 1. Repository Pattern

Services act as repositories for data access:

```typescript
class AnimalsService {
  private collection = collection(this.firestore, 'animals');

  getAll(): Observable<Animal[]> {
    // Query Firestore
  }
}
```

### 2. Observer Pattern

Components subscribe to Observable streams:

```typescript
this.animals$ = this.animalsService.getAll();
```

Template:
```html
<div *ngFor="let animal of animals$ | async">
```

### 3. Factory Pattern

Helper functions create empty model instances:

```typescript
export function createEmptyFarm(tenantId: string): Partial<Farm> {
  return {
    tenantId,
    isActive: true,
    // ...
  };
}
```

### 4. Guard Pattern

Route guards control access:

```typescript
@Injectable()
export class AuthGuard implements CanActivate {
  canActivate(): Observable<boolean> {
    return this.authService.currentUser$.pipe(
      map(user => !!user)
    );
  }
}
```

---

## Error Handling

### Service Layer

Services handle errors using RxJS operators:

```typescript
deleteAnimal(id: string): Observable<void> {
  return from(deleteDoc(docRef)).pipe(
    catchError(error => {
      console.error('Error deleting animal:', error);
      return throwError(() => error);
    })
  );
}
```

### Component Layer

Components handle errors in subscriptions:

```typescript
this.service.delete(id).subscribe({
  next: () => console.log('Success'),
  error: (error) => console.error('Error:', error)
});
```

---

## Performance Optimizations

### 1. TrackBy Functions

All `*ngFor` loops use trackBy:

```typescript
trackByAnimalId(index: number, animal: Animal): string {
  return animal.id!;
}
```

### 2. Lazy Loading

Routes are configured for lazy loading (can be optimized further).

### 3. OnPush Change Detection

Planned for Phase 2.

### 4. Query Optimization

- Indexed fields
- Limit query results
- Pagination (planned)

### 5. Caching

- Local component caching
- Service-level caching (planned)
- PWA caching (planned)

---

## Mobile-First Design

### Responsive Breakpoints

```scss
$breakpoint-md: 768px;  // Tablet
$breakpoint-lg: 1024px; // Desktop
```

### Responsive Patterns

1. **Mobile-first CSS**
```scss
.component {
  // Mobile styles (default)

  @media (min-width: $breakpoint-md) {
    // Tablet styles
  }

  @media (min-width: $breakpoint-lg) {
    // Desktop styles
  }
}
```

2. **Flexible Layouts**
- Flexbox for component layout
- CSS Grid for complex layouts
- Viewport units for spacing

3. **Touch-Friendly**
- Minimum 44px touch targets
- Adequate spacing
- Large buttons on mobile

---

## Build Architecture

### Development Build

```bash
npm start
# or
ng serve
```

**Features:**
- Source maps
- Hot reload
- No optimization
- Fast builds

### Production Build

```bash
npm run build
# or
ng build
```

**Optimizations:**
- Tree shaking
- Minification
- Compression
- Bundle optimization
- Ahead-of-Time (AOT) compilation

**Output:**
```
dist/farm-animal-tracker/
├── browser/              # Client-side files
│   ├── index.html
│   ├── main-*.js
│   ├── polyfills-*.js
│   └── styles-*.css
└── server/              # SSR files (if enabled)
```

---

## Deployment Architecture

### Firebase Hosting

```
User Request
    ↓
Firebase CDN (Global)
    ↓
Cached Static Files
    ↓
Angular SPA
    ↓
Firestore API
```

**Benefits:**
- Global CDN
- Automatic SSL
- Custom domains
- Automatic scaling
- Zero configuration

---

## Testing Strategy

### Unit Testing

**Framework:** Jasmine + Karma

**Coverage:**
- Services (planned)
- Components (planned)
- Guards (planned)

### E2E Testing

**Framework:** TBD

### Manual Testing

Current approach for MVP.

---

## Future Architecture Enhancements

### Phase 2 Planned Improvements

1. **State Management**
   - NgRx or Akita for complex state
   - Centralized store

2. **Progressive Web App (PWA)**
   - Service workers
   - Offline support
   - App-like experience

3. **Performance**
   - OnPush change detection
   - Virtual scrolling for large lists
   - Image optimization

4. **Security**
   - Firestore security rules
   - Role-based UI
   - Audit logging

5. **Testing**
   - Comprehensive unit tests
   - E2E test suite
   - Integration tests

6. **CI/CD**
   - Automated builds
   - Automated testing
   - Automated deployment

7. **Monitoring**
   - Error tracking (Sentry)
   - Analytics (Google Analytics)
   - Performance monitoring

---

## Scalability Considerations

### Current Scalability

**Strengths:**
- Firebase auto-scaling
- Multi-tenant architecture
- Efficient queries
- CDN distribution

**Limitations:**
- No pagination (small datasets only)
- No caching layer
- Limited offline support

### Scaling Strategy

**For 100+ users:**
- Implement pagination
- Add query caching
- Optimize bundle size

**For 1000+ users:**
- Add Cloud Functions for complex operations
- Implement background jobs
- Add monitoring and alerting

**For 10000+ users:**
- Consider microservices
- Add dedicated backend
- Implement advanced caching

---

**Last Updated:** November 2024
**Version:** 1.0.0 (MVP)
