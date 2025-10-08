import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { HomeComponent } from './home/home.component';
import { AddAnimalComponent } from './features/animals/components/add-animal/add-animal.component';
import { EditAnimalComponent } from './features/animals/components/edit-animal/edit-animal.component';
import { AuthGuard } from './auth/auth.guard';
import { UserProfileComponent } from './user-profile/user-profile.component';

// Animal Health
import { HealthComponent } from './features/healthRecords/components/health/health.component';
import { AddHealthComponent } from './features/healthRecords/components/add-health/add-health.component';
import { EditHealthComponent } from './features/healthRecords/components/edit-health/edit-health.component';

// Breeding
import { BreedingEventComponent } from './features/breedingEvent/components/breedingEvent/breedingEvent.component';
import { AddBreedingComponent } from './features/breedingEvent/components/add-breeding/add-breeding.component';
import { EditBreedingComponent } from './features/breedingEvent/components/edit-breeding/edit-breeding.component';

// Pregnancy Check
import { PregnancyCheckComponent } from './features/breedingEvent/components/pregnancy-check/pregnancy-check.component'; 
import { AddPregnancyCheckComponent } from './features/breedingEvent/components/add-pregnancy-check/add-pregnancy-check.component'; 
import { EditPregnancyCheckComponent } from './features/breedingEvent/components/edit-pregnancy-check/edit-pregnancy-check.component'; 

// Hormone Treatment
import { HormoneTreatmentListComponent } from './features/breedingEvent/components/hormone-treatment-list/hormone-treatment-list.component'; 
import { AddHormoneTreatmentComponent } from './features/breedingEvent/components/add-hormone-treatment/add-hormone-treatment.component';
import { EditHormoneTreatmentComponent } from './features/breedingEvent/components/edit-hormone-treatment/edit-hormone-treatment.component'; 

// Birthing Schedule
import { BirthingScheduleComponent } from './features/birthing/components/birthing-schedule/birthing-schedule.component'; 
import { AddBirthingScheduleComponent } from './features/birthing/components/add-birthing-schedule/add-birthing-schedule.component';
import { EditBirthingScheduleComponent } from './features/birthing/components/edit-birthing-schedule/edit-birthing-schedule.component';

// Weaning Schedule
import { WeaningScheduleComponent } from './features/weaning/components/weaning-schedule/weaning-schedule.component'; 
import { AddWeaningScheduleComponent } from './features/weaning/components/add-weaning-schedule/add-weaning-schedule.component';
import { EditWeaningScheduleComponent } from './features/weaning/components/edit-weaning-schedule/edit-weaning-schedule.component';


export const routes: Routes = [
    { path: '', component: HomeComponent, canActivate: [AuthGuard] },
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignupComponent },
    { path: 'add-animal', component: AddAnimalComponent, canActivate: [AuthGuard] },
    { path: 'edit-animal/:id', component: EditAnimalComponent, canActivate: [AuthGuard] },
    { path: 'profile', component: UserProfileComponent, canActivate: [AuthGuard] },
    
    // Health Records Module Routes
    { path: 'animals/:id/health', component: HealthComponent }, 
    { path: 'animals/:id/add-health', component: AddHealthComponent },
    { path: 'animals/:id/health/edit/:recordId', component: EditHealthComponent }, // Assuming an EditHealthComponent exists or will be added
    
    // Breeding Module Routes
    { path: 'animals/:id/breeding', component: BreedingEventComponent },
    { path: 'animals/:id/breeding/add', component: AddBreedingComponent },
    { path: 'animals/:id/breeding/edit/:eventId', component: EditBreedingComponent },

    // **NEW Pregnancy Check Routes (Level 2 - Nested under Breeding Event)**
    { path: 'animals/:id/breeding/:eventId/checks', component: PregnancyCheckComponent },
    { path: 'animals/:id/breeding/:eventId/checks/add', component: AddPregnancyCheckComponent },
    { path: 'animals/:id/breeding/:eventId/checks/edit/:checkId', component: EditPregnancyCheckComponent },

    // Hormone Treatment Routes (Nested under Breeding Event)
    { path: 'animals/:id/breeding/:eventId/treatments', component: HormoneTreatmentListComponent },
    { path: 'animals/:id/breeding/:eventId/treatments/add', component: AddHormoneTreatmentComponent },
    { path: 'animals/:id/breeding/:eventId/treatments/edit/:treatmentId', component: EditHormoneTreatmentComponent },

    // Birthing Records Module Routes
    { path: 'animals/:id/birthing', component: BirthingScheduleComponent }, 
    { path: 'animals/:id/birthing/add', component: AddBirthingScheduleComponent },
    { path: 'animals/:id/birthing/edit/:recordId', component: EditBirthingScheduleComponent },

    // Weaning Schedule
    { 
        path: 'animals/:id/weaning', 
        component: WeaningScheduleComponent // The list view
    }, 
    { 
        path: 'animals/:id/weaning/add', 
        component: AddWeaningScheduleComponent // The creation form
    },
    { 
        path: 'animals/:id/weaning/edit/:recordId', 
        component: EditWeaningScheduleComponent // The editing form
    },


    { path: '**', redirectTo: '/' },
];