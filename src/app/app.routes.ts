import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { HomeComponent } from './home/home.component';
import { AddAnimalComponent } from './features/animals/components/add-animal/add-animal.component';
import { EditAnimalComponent } from './features/animals/components/edit-animal/edit-animal.component';
import { AuthGuard } from './auth/auth.guard';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { HealthComponent } from './features/healthRecords/components/health/health.component';
import { AddHealthComponent } from './features/healthRecords/components/add-health/add-health.component';
import { EditHealthComponent } from './features/healthRecords/components/edit-health/edit-health.component';
import { BreedingComponent } from './features/breeding/components/breeding/breeding.component';
import { AddBreedingComponent } from './features/breeding/components/add-breeding/add-breeding.component';
import { EditBreedingComponent } from './features/breeding/components/edit-breeding/edit-breeding.component';
import { PregnancyCheckComponent } from './features/breeding/components/pregnancy-check/pregnancy-check.component'; // <-- Add this import
import { AddPregnancyCheckComponent } from './features/breeding/components/add-pregnancy-check/add-pregnancy-check.component'; // <-- Add this import
import { EditPregnancyCheckComponent } from './features/breeding/components/edit-pregnancy-check/edit-pregnancy-check.component'; // <-- Add this import

export const routes: Routes = [
    { path: '', component: HomeComponent, canActivate: [AuthGuard] },
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignupComponent },
    { path: 'add-animal', component: AddAnimalComponent, canActivate: [AuthGuard] },
    { path: 'edit-animal/:id', component: EditAnimalComponent, canActivate: [AuthGuard] },
    { path: 'profile', component: UserProfileComponent, canActivate: [AuthGuard] }, 
    { path: 'animals/:id/health', component: HealthComponent, canActivate: [AuthGuard] }, 
    { path: 'animals/:id/add-health', component: AddHealthComponent, canActivate: [AuthGuard] },
    { path: 'animals/:id/health/edit/:recordId', component: EditHealthComponent, canActivate: [AuthGuard] },
    { path: 'animals/:id/breeding', component: BreedingComponent, canActivate: [AuthGuard] }, 
    { path: 'animals/:id/add-breeding', component: AddBreedingComponent, canActivate: [AuthGuard] },
    { path: 'animals/:id/breeding/edit/:recordId', component: EditBreedingComponent, canActivate: [AuthGuard] },
    { path: 'animals/:id/breeding/:eventId/checks', component: PregnancyCheckComponent },
    { path: 'animals/:id/breeding/:eventId/add-check', component: AddPregnancyCheckComponent },
    { path: 'animals/:id/breeding/:eventId/checks/edit/:checkId', component: EditPregnancyCheckComponent }, 
    { path: '**', redirectTo: '/animals' },
];