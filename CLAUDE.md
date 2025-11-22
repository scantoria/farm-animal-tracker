# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Farm Animal Tracker is an Angular 20.2 standalone application for managing farm animals and related records (health, breeding, birthing, weaning, medication, blacksmith services). It uses Firebase for authentication and data storage.

## Development Commands

```bash
# Start development server (http://localhost:4200)
ng serve

# Build for production
ng build

# Run unit tests
ng test

# Generate new component/service/etc
ng generate component features/feature-name/components/component-name
ng generate service core/services/service-name
```

## Architecture

### Standalone Components

This project uses Angular's standalone component architecture (no NgModules). All components, directives, and pipes are standalone and import their dependencies directly.

### Directory Structure

```
src/app/
├── auth/                    # Authentication (login, signup, AuthGuard)
├── core/
│   ├── services/           # Core business logic services
│   ├── facades/            # Facade pattern implementations
│   └── guards/             # Route guards
├── features/               # Feature modules organized by domain
│   ├── animals/           # Animal CRUD operations
│   ├── admin/             # Admin features (veterinarians, blacksmiths, farms, users)
│   ├── healthRecords/     # Animal health tracking
│   ├── breedingEvent/     # Breeding events, pregnancy checks, hormone treatments
│   ├── birthing/          # Birthing schedules
│   ├── weaning/           # Weaning schedules
│   ├── blacksmith/        # Blacksmith visit records
│   ├── medication-record/ # Medication tracking
│   ├── veterinarian/      # Veterinarian-specific views
│   └── providers/         # Provider dashboard
├── shared/
│   ├── components/        # Reusable components
│   ├── models/           # TypeScript interfaces/types
│   ├── pipes/            # Custom pipes
│   ├── directives/       # Custom directives
│   └── utils/            # Utility functions
├── home/                  # Home dashboard
└── user-profile/          # User profile management
```

### Feature Organization Pattern

Each feature follows this consistent structure:
- `components/` - UI components
- `pages/` - Route-level page components (if applicable)

Components follow a naming convention:
- List views: `{feature}-list.component.ts` or `{feature}.component.ts`
- Add forms: `add-{feature}.component.ts`
- Edit forms: `edit-{feature}.component.ts`

### Routing Architecture

Routes follow a hierarchical pattern centered around animals:

```
/                                    # Home (animal list)
/animals/:id/{feature}              # View feature records for an animal
/animals/:id/{feature}/add          # Add new record
/animals/:id/{feature}/edit/:recordId  # Edit existing record
```

**Nested Features**: Some features have sub-features (e.g., breeding events):
```
/animals/:id/breeding/:eventId/checks              # Pregnancy checks
/animals/:id/breeding/:eventId/treatments          # Hormone treatments
```

**Admin Routes**:
```
/admin/blacksmiths
/admin/veterinarian
```

All routes except `/login` and `/signup` are protected by `AuthGuard`.

### Firebase Integration

- **Authentication**: Firebase Auth with email/password via `AuthService` (core/services/auth.service.ts)
- **Database**: Firestore for all data storage
- **Configuration**: Firebase config in `src/environments/environment.ts`

Services use Angular Fire's modular SDK:
- Import from `@angular/fire/auth` and `@angular/fire/firestore`
- Services return RxJS Observables wrapping Firebase promises
- Use `from()` to convert Firebase promises to Observables

### Service Layer Pattern

Services in `core/services/` handle:
- Firestore CRUD operations
- Business logic
- Data transformation

Key services:
- `auth.service.ts` - Authentication (signIn, signUp, signOut, currentUser$)
- `animals.service.ts` - Animal CRUD, bloodline/lineage tracking
- `health.service.ts` - Health records
- `breeding.service.ts` - Breeding events, pregnancy checks, hormone treatments
- `birthing.service.ts` - Birthing schedules
- `weaning.service.ts` - Weaning schedules
- `blacksmith.service.ts` & `blacksmith-data.service.ts` - Blacksmith services
- `medication.service.ts` - Medication records
- `veterinarian-data.service.ts` - Veterinarian management
- `user-data.service.ts` - User data management
- `confirm.service.ts` - Confirmation dialogs
- `sire.service.ts` - External sires management (AI, leased bulls)
- `document.service.ts` - Document/file upload management
- `farm.service.ts` - Farm locations and animal transfers

### Styling

- **Preprocessor**: SCSS
- **Style Path**: `src/app/styles/` (configured in angular.json)
- **Prettier**: Configured in package.json (100 char width, single quotes, Angular HTML parser)

## Code Generation Configuration

The project has `skipTests: true` configured for all Angular schematics (components, services, guards, etc.). When generating new code, tests will not be created automatically.

## Development Notes

- **Component Prefix**: `app` (standard Angular prefix)
- **TypeScript**: v5.9.2
- **Angular Version**: 20.2.x
- **Server-Side Rendering**: Configured with Angular SSR (see serve:ssr script)

## Important Patterns

1. **AuthGuard Usage**: Protect routes by adding `canActivate: [AuthGuard]` to route definitions
2. **Service Injection**: Use `providedIn: 'root'` for singleton services
3. **Observable Pattern**: Services return Observables; components subscribe in templates with async pipe
4. **Route Parameters**: Access via `ActivatedRoute` - common params are `id` (animalId), `recordId`, `eventId`, `checkId`, `treatmentId`
5. **Navigation**: Use `Router` service or `[routerLink]` directive with array syntax

## Git Workflow

**Always create a feature branch before making code changes.**

Before starting any feature or bug fix:
1. Create a new branch: `git checkout -b feature/descriptive-name` or `git checkout -b fix/descriptive-name`
2. Make changes on the feature branch
3. Commit with descriptive messages
4. User will review and merge to main when ready

Branch naming conventions:
- `feature/` - New features (e.g., `feature/sires-management`)
- `fix/` - Bug fixes (e.g., `fix/form-validation`)
- `refactor/` - Code refactoring
- `docs/` - Documentation updates

## Deployment

Deploy to Firebase Hosting:
```bash
ng build && firebase deploy
```

Hosting URL: https://farmanimaltracker.web.app
