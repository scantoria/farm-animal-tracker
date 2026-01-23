# Farm Animal Tracker - Requirements Specification

**Version:** 1.0
**Last Updated:** January 10, 2026
**Status:** Production

---

## 1. Executive Summary

Farm Animal Tracker is a comprehensive web-based application designed to manage farm animals and their associated records across multiple farm locations. The system provides end-to-end tracking of animal health, breeding, birthing, weaning, medication, and service provider management with multi-tenant support and role-based access control.

---

## 2. Stakeholders

### 2.1 Primary Users
- **Farm Owners/Managers** - Manage animals, farms, and operational records
- **Veterinarians** - Access animal health records and treatment history
- **Farm Staff** - Daily animal management and record keeping
- **Administrators** - System configuration and user management

### 2.2 External Stakeholders
- **Blacksmiths** - Hoof care service providers
- **Veterinary Clinics** - Animal health service providers
- **Feed Suppliers** - Feed and supplement suppliers
- **AI Breeding Services** - Artificial insemination providers

---

## 3. Functional Requirements

### 3.1 Authentication & User Management

#### 3.1.1 User Authentication
- **REQ-AUTH-001**: System shall support email/password authentication via Firebase Auth
- **REQ-AUTH-002**: System shall maintain persistent login sessions
- **REQ-AUTH-003**: System shall provide secure logout functionality
- **REQ-AUTH-004**: System shall protect all routes except `/login` with authentication guard
- **REQ-AUTH-005**: System shall automatically redirect unauthenticated users to login page

#### 3.1.2 User Roles & Permissions
- **REQ-AUTH-006**: System shall support three user roles: Admin, User, Viewer
- **REQ-AUTH-007**: Admin role shall have full system access including user management
- **REQ-AUTH-008**: User role shall have access to animal management and record creation
- **REQ-AUTH-009**: Viewer role shall have read-only access to records
- **REQ-AUTH-010**: System shall restrict user invitation feature to admin-authorized email addresses

#### 3.1.3 User Invitation System
- **REQ-AUTH-011**: System shall provide invite-only user registration
- **REQ-AUTH-012**: System shall limit invitation capability to authorized admin emails:
  - stephen.cantoria@stjo.farm
  - jolene.cantoria@stjo.farm
- **REQ-AUTH-013**: System shall send invitation emails to new users
- **REQ-AUTH-014**: System shall create user records in Firestore upon registration

#### 3.1.4 User Profile Management
- **REQ-AUTH-015**: Users shall be able to view and update their profile information
- **REQ-AUTH-016**: System shall store user preferences and settings

---

### 3.2 Animal Management

#### 3.2.1 Animal Registration
- **REQ-ANM-001**: System shall support adding animals with following data:
  - Species (Cattle, Sheep, Goats, Pigs, Horses, Llamas, Alpacas, Donkeys, Mules)
  - Name (unique identifier)
  - Ear tag/identification number
  - Date of birth
  - Sex (male/female)
  - Breed
  - Color
  - Weight (current)
  - Purchase date and price
  - Farm assignment
  - Reproductive status
  - Profile image upload
  - Bloodline information (sire and dam)

- **REQ-ANM-002**: System shall validate required fields before saving
- **REQ-ANM-003**: System shall support image upload and storage for animal profiles
- **REQ-ANM-004**: System shall assign animals to specific farm locations
- **REQ-ANM-005**: System shall track animal status (Active, Sold, Deceased)

#### 3.2.2 Animal Editing & Updates
- **REQ-ANM-006**: Users shall be able to edit all animal information
- **REQ-ANM-007**: System shall provide delete functionality with confirmation
- **REQ-ANM-008**: System shall support status changes (active/sold/deceased)
- **REQ-ANM-009**: System shall maintain data integrity when updating animal records

#### 3.2.3 Animal Viewing & Search
- **REQ-ANM-010**: System shall display animals grouped by species
- **REQ-ANM-011**: System shall support sorting by:
  - Name (alphabetical)
  - Species
  - Date of birth
- **REQ-ANM-012**: System shall display reproductive status for each animal
- **REQ-ANM-013**: System shall show estimated due dates for pregnant animals
- **REQ-ANM-014**: System shall display parent information (sire/dam) on animal cards
- **REQ-ANM-015**: System shall filter animals by status, species, and reproductive status

#### 3.2.4 Bloodline & Pedigree Tracking
- **REQ-ANM-016**: System shall track sire (father) for each animal
- **REQ-ANM-017**: System shall track dam (mother) for each animal
- **REQ-ANM-018**: System shall support selection of internal animals or external sires
- **REQ-ANM-019**: System shall display multi-generational lineage (grandparents)
- **REQ-ANM-020**: System shall maintain lineage relationships across animal records

---

### 3.3 Health Records Management

#### 3.3.1 General Health Tracking
- **REQ-HEALTH-001**: System shall track health events including:
  - Hoof trimming
  - Vaccinations
  - General checkups
  - Injury treatments
  - Illness records
  - Other health events

- **REQ-HEALTH-002**: Each health record shall capture:
  - Event date
  - Health event type
  - Description/notes
  - Treatment provided
  - Associated animal reference

- **REQ-HEALTH-003**: System shall support adding, viewing, and editing health records
- **REQ-HEALTH-004**: System shall display health history chronologically per animal

#### 3.3.2 Castration Tracking
- **REQ-HEALTH-005**: System shall track castration procedures with:
  - Castration date
  - Method (Surgical, Banding, Burdizzo)
  - Age at castration
  - Recovery notes
  - Complication tracking

#### 3.3.3 Dehorning Tracking
- **REQ-HEALTH-006**: System shall track dehorning procedures with:
  - Dehorning date
  - Method (Surgical, Caustic paste, Hot iron)
  - Age at dehorning
  - Recovery notes
  - Complication tracking

---

### 3.4 Breeding Management

#### 3.4.1 Breeding Event Tracking
- **REQ-BREED-001**: System shall track breeding events with:
  - Event date
  - Event type (Heat Detected, Breeding, etc.)
  - Sire selection (internal animal or external sire)
  - Dam reference (animal being bred)
  - Notes

- **REQ-BREED-002**: System shall support adding, viewing, and editing breeding events
- **REQ-BREED-003**: System shall link breeding events to specific animals
- **REQ-BREED-004**: System shall calculate estimated due dates based on species gestation periods

#### 3.4.2 Pregnancy Check Tracking
- **REQ-BREED-005**: System shall track pregnancy checks nested under breeding events with:
  - Check date
  - Results (Pregnant, Open, Recheck Required)
  - Confirmation method (Ultrasound, Blood Test, Palpation, Visual)
  - Next check date
  - Notes

- **REQ-BREED-006**: System shall support multiple pregnancy checks per breeding event
- **REQ-BREED-007**: System shall update animal reproductive status based on pregnancy results
- **REQ-BREED-008**: System shall provide CRUD operations for pregnancy checks

#### 3.4.3 Hormone Treatment Tracking
- **REQ-BREED-009**: System shall track hormone treatments nested under breeding events with:
  - Treatment date
  - Treatment type (Heat synchronization, Ovulation induction)
  - Product name
  - Dosage
  - Administrator
  - Notes

- **REQ-BREED-010**: System shall support multiple hormone treatments per breeding event
- **REQ-BREED-011**: System shall provide CRUD operations for hormone treatments

---

### 3.5 Birthing Management

#### 3.5.1 Birthing Schedule Tracking
- **REQ-BIRTH-001**: System shall track birthing records with:
  - Dam (mother) animal reference
  - Birth date
  - Sex of offspring (bull, heifer, colt, filly, doe, buck, ewe, ram)
  - Sire information
  - Birth weight
  - Offspring tag/identification
  - Calving ease (Easy, Assisted, Hard Pull)
  - Breed
  - Species
  - Notes

- **REQ-BIRTH-002**: System shall support species-specific offspring sex options
- **REQ-BIRTH-003**: System shall link birthing records to dam animals
- **REQ-BIRTH-004**: System shall provide CRUD operations for birthing schedules

---

### 3.6 Weaning Management

#### 3.6.1 Weaning Schedule Tracking
- **REQ-WEAN-001**: System shall track weaning records with:
  - Weaning date
  - Weaning method (Abrupt, Fence-line, Two-stage)
  - Notes and observations

- **REQ-WEAN-002**: System shall link weaning records to specific animals
- **REQ-WEAN-003**: System shall provide CRUD operations for weaning schedules

---

### 3.7 Medication Tracking

#### 3.7.1 Medication Record Management
- **REQ-MED-001**: System shall track medication records with:
  - Visit date
  - Provider/veterinarian name
  - Treatment type (Vaccination, Deworming, Injury treatment, etc.)
  - Medication name
  - Dosage information
  - Clinical notes

- **REQ-MED-002**: System shall link medication records to specific animals
- **REQ-MED-003**: System shall provide CRUD operations for medication records
- **REQ-MED-004**: System shall maintain medication history per animal

---

### 3.8 Veterinarian Visit Management

#### 3.8.1 Visit Tracking
- **REQ-VET-001**: System shall track veterinarian visits with:
  - Visit date
  - Veterinarian reference
  - Visit type (Routine Checkup, Emergency, Vaccination, Surgery, Medication Administration, Other)
  - Diagnosis
  - Treatment provided
  - Medications administered
  - Next appointment date
  - Clinical notes

- **REQ-VET-002**: System shall link visits to specific animals
- **REQ-VET-003**: System shall provide CRUD operations for veterinarian visits
- **REQ-VET-004**: System shall schedule follow-up appointments

---

### 3.9 Blacksmith Service Management

#### 3.9.1 Blacksmith Visit Tracking
- **REQ-BLACK-001**: System shall track blacksmith visits with:
  - Visit date
  - Service provided (Trim, Shoeing, Corrective work)
  - Provider selection
  - Next appointment date
  - Service notes

- **REQ-BLACK-002**: System shall link blacksmith visits to specific animals
- **REQ-BLACK-003**: System shall provide CRUD operations for blacksmith visits
- **REQ-BLACK-004**: System shall schedule recurring appointments

---

### 3.10 Farm Management

#### 3.10.1 Farm Information Management
- **REQ-FARM-001**: System shall track farm locations with:
  - Farm name
  - Address (street, city, state, zip)
  - Acreage
  - Active/archived status
  - Supplier relationships

- **REQ-FARM-002**: System shall provide CRUD operations for farm records
- **REQ-FARM-003**: System shall display animal count per farm
- **REQ-FARM-004**: System shall support farm archival (soft delete)

#### 3.10.2 Farm Facilities Tracking
- **REQ-FARM-005**: System shall track farm facilities:
  - Barn presence
  - Hay storage capacity (round bales)
  - Cattle chute availability
  - Loading ramp
  - Water source
  - Shelter
  - Facility notes

#### 3.10.3 Animal Transfer Management
- **REQ-FARM-006**: System shall support bulk animal transfers between farms
- **REQ-FARM-007**: System shall track movement reasons:
  - Winter Housing
  - Summer Grazing
  - Weaning
  - Breeding
  - Medical Treatment
  - Sale Prep
  - Quarantine
  - Other

- **REQ-FARM-008**: System shall maintain movement history per animal
- **REQ-FARM-009**: System shall update current farm assignment on transfer
- **REQ-FARM-010**: System shall record user and timestamp for movements

---

### 3.11 External Sires Management

#### 3.11.1 Sire Registration
- **REQ-SIRE-001**: System shall track external sires with:
  - Name
  - Registration number
  - Species and breed
  - Bloodline information (sire name, dam name)
  - Source (AI, Leased, Owned)
  - Provider information (AI company, owner)
  - Status (Active, Inactive, Retired)
  - Notes

- **REQ-SIRE-002**: System shall provide CRUD operations for sires
- **REQ-SIRE-003**: System shall track breeding count per sire
- **REQ-SIRE-004**: System shall filter sires by species, status, and search term
- **REQ-SIRE-005**: System shall integrate sires with breeding event management

---

### 3.12 Admin Features

#### 3.12.1 Blacksmith Management
- **REQ-ADMIN-001**: Admin users shall manage blacksmith providers with:
  - Name
  - Specialty
  - Contact information (phone, email)
  - Service area

- **REQ-ADMIN-002**: System shall provide CRUD operations for blacksmith records

#### 3.12.2 Veterinarian Management
- **REQ-ADMIN-003**: Admin users shall manage veterinarian providers with:
  - Name
  - Specialty (General, Bovine, Equine, Caprine, Ovine)
  - Contact information (phone, email)
  - Clinic affiliation

- **REQ-ADMIN-004**: System shall provide CRUD operations for veterinarian records

#### 3.12.3 Feed Supplier Management
- **REQ-ADMIN-005**: Admin users shall manage feed suppliers with:
  - Company name
  - Contact person, phone, email
  - Address
  - Products offered
  - Delivery availability
  - Minimum order quantities
  - Status (active/inactive)

- **REQ-ADMIN-006**: System shall track feed product types:
  - Hay (round/square bales)
  - Alfalfa
  - Grain
  - Supplements
  - Salt
  - Calf Starter
  - Silage
  - Other

- **REQ-ADMIN-007**: System shall provide CRUD operations for feed supplier records
- **REQ-ADMIN-008**: System shall track farm-supplier relationships
- **REQ-ADMIN-009**: System shall track feed orders with status (pending, in-transit, delivered, cancelled)

#### 3.12.4 User Management
- **REQ-ADMIN-010**: Admin users shall view all system users
- **REQ-ADMIN-011**: Admin users shall delete user accounts
- **REQ-ADMIN-012**: Admin users shall manage user roles

---

### 3.13 Document Management

#### 3.13.1 Document Upload & Storage
- **REQ-DOC-001**: System shall support document uploads per animal
- **REQ-DOC-002**: System shall support document types:
  - Registration papers
  - Health certificates
  - Vaccination records
  - Purchase receipts
  - Insurance documents
  - Pedigree/lineage documents
  - Other

- **REQ-DOC-003**: System shall accept file types:
  - Images (JPEG, PNG, GIF, WebP)
  - PDF
  - Office documents (Word, Excel)
  - Plain text

- **REQ-DOC-004**: System shall enforce 10MB file size limit
- **REQ-DOC-005**: System shall store documents in Firebase Cloud Storage
- **REQ-DOC-006**: System shall isolate documents per tenant
- **REQ-DOC-007**: System shall validate file type and size before upload
- **REQ-DOC-008**: System shall display upload progress

---

## 4. Non-Functional Requirements

### 4.1 Performance
- **REQ-PERF-001**: System shall load animal list within 2 seconds for up to 1000 animals
- **REQ-PERF-002**: System shall complete CRUD operations within 3 seconds
- **REQ-PERF-003**: System shall handle concurrent users (up to 50) without degradation
- **REQ-PERF-004**: System shall implement lazy loading for large data sets

### 4.2 Security
- **REQ-SEC-001**: System shall enforce authentication for all protected routes
- **REQ-SEC-002**: System shall use Firebase Auth security rules
- **REQ-SEC-003**: System shall implement multi-tenant data isolation via tenantId
- **REQ-SEC-004**: System shall prevent cross-tenant data access
- **REQ-SEC-005**: System shall validate user permissions before operations
- **REQ-SEC-006**: System shall use HTTPS for all communications
- **REQ-SEC-007**: System shall sanitize user inputs to prevent XSS attacks
- **REQ-SEC-008**: System shall implement secure file upload validation

### 4.3 Scalability
- **REQ-SCALE-001**: System shall support multiple farm operations (tenants)
- **REQ-SCALE-002**: System shall handle growth to 10,000+ animals per tenant
- **REQ-SCALE-003**: System shall scale horizontally via Firebase infrastructure
- **REQ-SCALE-004**: System shall use efficient Firestore queries to minimize reads

### 4.4 Reliability
- **REQ-REL-001**: System shall have 99.5% uptime
- **REQ-REL-002**: System shall implement error handling for all Firebase operations
- **REQ-REL-003**: System shall log errors for debugging and monitoring
- **REQ-REL-004**: System shall provide user-friendly error messages

### 4.5 Usability
- **REQ-USE-001**: System shall provide responsive design for desktop and tablet devices
- **REQ-USE-002**: System shall use consistent navigation patterns
- **REQ-USE-003**: System shall display loading states during async operations
- **REQ-USE-004**: System shall provide confirmation dialogs for destructive operations
- **REQ-USE-005**: System shall use clear, descriptive labels and placeholders
- **REQ-USE-006**: System shall group related information logically

### 4.6 Maintainability
- **REQ-MAINT-001**: Code shall follow Angular style guide conventions
- **REQ-MAINT-002**: Code shall use TypeScript strict mode
- **REQ-MAINT-003**: Code shall implement standalone component architecture
- **REQ-MAINT-004**: Code shall follow consistent file naming conventions
- **REQ-MAINT-005**: Code shall use Prettier formatting (100 char width, single quotes)

### 4.7 Browser Compatibility
- **REQ-COMPAT-001**: System shall support latest versions of Chrome, Firefox, Safari, Edge
- **REQ-COMPAT-002**: System shall degrade gracefully on unsupported browsers

### 4.8 Data Integrity
- **REQ-DATA-001**: System shall validate all form inputs before submission
- **REQ-DATA-002**: System shall prevent duplicate animal identifications
- **REQ-DATA-003**: System shall maintain referential integrity between related records
- **REQ-DATA-004**: System shall use Firebase transactions for critical operations
- **REQ-DATA-005**: System shall handle concurrent updates appropriately

---

## 5. Business Logic Requirements

### 5.1 Gestation Period Calculations
- **REQ-BIZ-001**: System shall calculate estimated due dates using species-specific gestation periods:
  - Cattle: 283 days
  - Sheep: 150 days
  - Goats: 150 days
  - Pigs: 114 days
  - Horses: 340 days
  - Llamas: 350 days
  - Alpacas: 345 days
  - Donkeys: 365 days
  - Mules: Not applicable (sterile)

- **REQ-BIZ-002**: System shall update due dates when breeding dates change
- **REQ-BIZ-003**: System shall display calculated due dates on animal list

### 5.2 Reproductive Status Logic
- **REQ-BIZ-004**: System shall provide status options based on sex:
  - Female: Open, Pregnant, Unknown
  - Male: Intact, Castrated, Unknown

- **REQ-BIZ-005**: System shall update reproductive status from pregnancy check results

### 5.3 Age Calculations
- **REQ-BIZ-006**: System shall calculate current age from date of birth
- **REQ-BIZ-007**: System shall display age in appropriate units (days, months, years)

---

## 6. Integration Requirements

### 6.1 Firebase Authentication
- **REQ-INT-001**: System shall integrate with Firebase Auth for user management
- **REQ-INT-002**: System shall use Firebase Auth UID as tenant identifier

### 6.2 Firebase Firestore
- **REQ-INT-003**: System shall use Firestore for all data persistence
- **REQ-INT-004**: System shall implement proper Firestore security rules
- **REQ-INT-005**: System shall use subcollections for nested data (health records, breeding events, etc.)

### 6.3 Firebase Cloud Storage
- **REQ-INT-006**: System shall use Firebase Storage for file uploads
- **REQ-INT-007**: System shall implement tenant-isolated storage paths
- **REQ-INT-008**: System shall generate secure download URLs for documents

---

## 7. Deployment Requirements

### 7.1 Hosting
- **REQ-DEPLOY-001**: System shall be deployed to Firebase Hosting
- **REQ-DEPLOY-002**: System shall be accessible at https://farmanimaltracker.web.app
- **REQ-DEPLOY-003**: System shall use HTTPS only

### 7.2 Build Process
- **REQ-DEPLOY-004**: System shall build with production optimizations enabled
- **REQ-DEPLOY-005**: System shall implement code splitting for optimal loading
- **REQ-DEPLOY-006**: System shall support server-side rendering (Angular SSR)

---

## 8. Constraints & Assumptions

### 8.1 Technical Constraints
- Must use Angular 20.2 standalone architecture
- Must use Firebase for authentication and data storage
- Must support modern browsers only (Chrome, Firefox, Safari, Edge latest versions)
- Must use TypeScript 5.9+

### 8.2 Business Constraints
- Single-tenant per user (tenantId = user's Firebase UID)
- Invite-only user registration
- Admin access limited to authorized emails

### 8.3 Assumptions
- Users have stable internet connectivity
- Users access system from desktop or tablet devices
- All animal data is in English
- Dates use standard Gregorian calendar
- Weights use standard units (lbs)

---

## 9. Future Enhancements (Out of Scope)

The following features are documented for potential future implementation but are not part of current requirements:

1. **Mobile Application** - Native iOS/Android apps
2. **Offline Support** - Progressive Web App with offline capabilities
3. **Reporting & Analytics** - Advanced reporting dashboards
4. **Barcode/QR Code Scanning** - Quick animal lookup via scanning
5. **Automated Alerts** - Email/SMS notifications for due dates, appointments
6. **Financial Management** - Expense tracking, profit/loss calculations
7. **Feed Inventory Management** - Real-time feed stock tracking
8. **Weather Integration** - Weather data for farm operations
9. **Multi-language Support** - Internationalization
10. **Export/Import** - Bulk data export/import capabilities
11. **Third-party Integrations** - USDA reporting, breed registries
12. **Advanced Genetics** - Genetic trait predictions, breeding recommendations

---

## 10. Acceptance Criteria

### 10.1 System Launch Criteria
- All functional requirements (REQ-AUTH through REQ-DOC) implemented and tested
- All non-functional requirements (performance, security, usability) met
- User documentation complete
- Firebase deployment successful
- Admin users can invite and manage users
- Users can manage animals across complete lifecycle (birth to sale/death)
- All service provider integrations functional

### 10.2 Performance Benchmarks
- Animal list loads in < 2 seconds for 500 animals
- Form submissions complete in < 3 seconds
- Document uploads complete in < 10 seconds for 10MB file
- Zero data loss during concurrent operations

### 10.3 Security Validation
- Authentication enforced on all protected routes
- Multi-tenant isolation verified
- No cross-tenant data access possible
- File upload validation prevents malicious files

---

## 11. Traceability Matrix

Each requirement maps to:
- **Design Document Section** - Architecture implementation
- **Test Cases** - Verification methods
- **User Stories** - Business value justification

(Detailed traceability matrix maintained separately)

---

**Document Control**

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2026-01-10 | System Analyst | Initial comprehensive requirements |

---

**Approval**

This requirements specification requires approval from:
- Project Sponsor
- Product Owner
- Technical Lead
- Quality Assurance Lead

---

End of Requirements Specification
