# Farm Animal Tracker (FAT App)

**Comprehensive farm animal management system for tracking livestock health, breeding, farm locations, and service providers.**

---

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [Project Status](#project-status)
- [License](#license)

---

## Overview

The Farm Animal Tracker (FAT App) is a web-based application designed to help farmers and ranchers manage their livestock operations efficiently. The system provides comprehensive tracking for:

- Individual animal records and identification
- Health records and veterinary visits
- Breeding events and pregnancy tracking
- Birthing and weaning schedules
- Farm location management
- Service provider management (veterinarians, farriers, feed suppliers)
- Medication and treatment tracking

### Key Benefits

- **Centralized Data Management** - All animal and farm data in one place
- **Multi-Tenant Support** - Supports multiple independent farm operations
- **Comprehensive Record Keeping** - Track every aspect of animal care
- **Provider Management** - Manage relationships with veterinarians, farriers, and suppliers
- **Mobile-First Design** - Responsive UI works on all devices
- **Real-Time Updates** - Firebase backend provides instant synchronization

---

## Features

### Core Animal Management
- ✅ **Animal Records** - Complete CRUD for animal profiles
- ✅ **Health Records** - Track vaccinations, treatments, and medical history
- ✅ **Breeding Management** - Breeding events with nested pregnancy checks and hormone treatments
- ✅ **Birthing Records** - Track births, offspring details, and calving ease
- ✅ **Weaning Schedules** - Manage weaning dates and methods
- ✅ **Blacksmith Visits** - Track hoof care and shoeing services
- ✅ **Veterinarian Visits** - Record vet appointments and treatments
- ✅ **Medication Tracking** - Log all medication administrations

### Farm & Location Management
- ✅ **Farm Locations** - Manage multiple farm properties
- ✅ **Farm Facilities** - Track barns, chutes, water sources, and other infrastructure
- ✅ **Animal Movement** - Track animal transfers between farms (Service layer complete, UI planned for Phase 2)

### Provider Management
- ✅ **Veterinarian Directory** - Manage vet contacts and specialties
- ✅ **Blacksmith Directory** - Farrier contact management
- ✅ **Feed Supplier Management** - Track feed suppliers and delivery information
- ✅ **Provider Dashboard** - Unified view of all service providers

### Administration
- ✅ **User Authentication** - Firebase Auth with email/password
- ✅ **User Profiles** - User account management
- ✅ **Role-Based Access** - Admin, User, and Viewer roles
- ✅ **Multi-Tenant Architecture** - Isolate data by tenant ID

---

## Technology Stack

### Frontend
- **Framework**: Angular 20.2
- **Architecture**: Standalone Components (no NgModules)
- **Styling**: SCSS with mobile-first responsive design
- **Forms**: Template-driven and Reactive Forms
- **Icons**: Bootstrap Icons
- **State Management**: RxJS Observables

### Backend
- **Database**: Cloud Firestore (NoSQL)
- **Authentication**: Firebase Authentication
- **Hosting**: Firebase Hosting
- **Storage**: Firebase Storage (planned)
- **Functions**: Cloud Functions (planned for advanced features)

### Development Tools
- **Language**: TypeScript 5.9
- **Build Tool**: Angular CLI 20.2
- **Version Control**: Git
- **Package Manager**: npm

---

## Quick Start

### Prerequisites

- Node.js 20+ and npm
- Angular CLI: `npm install -g @angular/cli`
- Firebase CLI: `npm install -g firebase-tools`

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd farm-animal-tracker

# Install dependencies
npm install

# Start development server
npm start
```

Navigate to `http://localhost:4200/`

### Firebase Configuration

1. Create a Firebase project at https://console.firebase.google.com
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Update `src/environments/environment.ts` with your Firebase config

### Build for Production

```bash
# Build the application
npm run build

# Deploy to Firebase Hosting
firebase deploy --only hosting
```

---

## Documentation

Comprehensive documentation is available in the `/docs` directory:

- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - System architecture and design patterns
- **[DATA-MODELS.md](./docs/DATA-MODELS.md)** - Complete database schema and models
- **[COMPONENTS.md](./docs/COMPONENTS.md)** - UI component structure and hierarchy
- **[API.md](./docs/API.md)** - Service layer and API documentation
- **[DEPLOYMENT.md](./docs/DEPLOYMENT.md)** - Deployment guide and configuration
- **[ROADMAP.md](./docs/ROADMAP.md)** - Phase 2 features and future enhancements

---

## Project Status

**Current Version**: MVP (Phase 1)
**Status**: ✅ Deployed to Production
**Live URL**: https://farmanimaltracker.web.app
**Custom Domain**: https://fat.stjo.farm (pending DNS propagation)

### MVP Features Completed

- ✅ Animal management (CRUD)
- ✅ Health records tracking
- ✅ Breeding event management
- ✅ Pregnancy checks (nested under breeding)
- ✅ Hormone treatment tracking (nested under breeding)
- ✅ Birthing schedules
- ✅ Weaning schedules
- ✅ Blacksmith visit tracking
- ✅ Veterinarian visit tracking
- ✅ Medication record tracking
- ✅ Farm location management
- ✅ Feed supplier management
- ✅ Provider dashboard
- ✅ User authentication
- ✅ Multi-tenant support
- ✅ Mobile-responsive UI
- ✅ Firebase deployment

### Phase 2 Roadmap

See [ROADMAP.md](./docs/ROADMAP.md) for detailed Phase 2 planning including:
- Feed order management UI
- Farm movement tracking UI
- Advanced reporting and analytics
- Export capabilities
- Mobile app
- And more...

---

## Project Structure

```
farm-animal-tracker/
├── src/
│   ├── app/
│   │   ├── auth/                  # Authentication components
│   │   ├── core/
│   │   │   ├── services/          # All data services
│   │   │   └── guards/            # Route guards
│   │   ├── features/
│   │   │   ├── animals/           # Animal CRUD
│   │   │   ├── healthRecords/     # Health tracking
│   │   │   ├── breedingEvent/     # Breeding management
│   │   │   ├── birthing/          # Birthing records
│   │   │   ├── weaning/           # Weaning schedules
│   │   │   ├── blacksmith/        # Blacksmith visits
│   │   │   ├── veterinarian-visit/# Vet visits
│   │   │   ├── medication-record/ # Medication tracking
│   │   │   ├── farms/             # Farm management
│   │   │   └── admin/             # Admin modules
│   │   ├── shared/
│   │   │   └── models/            # TypeScript interfaces
│   │   ├── home/                  # Home component
│   │   └── user-profile/          # User profile
│   ├── environments/              # Environment configs
│   └── assets/                    # Static assets
├── docs/                          # Documentation
├── firebase.json                  # Firebase configuration
├── .firebaserc                    # Firebase project
└── package.json                   # Dependencies
```

---

## 🔐 User Management (Updated)

**Authentication is now invitation-only.**

### Creating New Users

Only authorized administrators (stephen.cantoria@stjo.farm and jolene.cantoria@stjo.farm) can create new user accounts.

**To invite a new user:**
1. Login as an authorized admin
2. Navigate to: `/admin/invite-user` (hidden page)
3. Enter new user's email and temporary password
4. Share credentials securely with new user

For detailed instructions, see [INVITE_USER_INSTRUCTIONS.md](./INVITE_USER_INSTRUCTIONS.md)

### Public Signup Removed

- ❌ Public signup route removed
- ❌ "Sign Up" button removed from navigation
- ✅ Admin-only invitation system active
- ✅ Hidden invite page: `/admin/invite-user`

---

## Contributing

This is a proprietary project. For questions or support, contact the development team.

---

## Support

For technical support or questions:
- **Email**: stephen.cantoria@thisbyte.com
- **Project Lead**: Stephen Cantoria

---

## License

Proprietary - All rights reserved

---

## Acknowledgments

Built with:
- Angular Framework by Google
- Firebase Platform by Google
- Bootstrap Icons
- RxJS Library

---

**Last Updated**: November 2024
**Version**: 1.0.0 (MVP)
