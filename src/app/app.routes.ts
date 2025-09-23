import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { HomeComponent } from './home/home.component';
import { AddAnimalComponent } from './features/animals/components/add-animal/add-animal.component';
import { EditAnimalComponent } from './features/animals/components/edit-animal/edit-animal.component';
import { AuthGuard } from './auth/auth.guard';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { HealthComponent } from './features/health/components/health/health.component';
import { AddHealthComponent } from './features/health/components/add-health/add-health.component';

export const routes: Routes = [
    { path: '', component: HomeComponent, canActivate: [AuthGuard] },
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignupComponent },
    { path: 'add-animal', component: AddAnimalComponent, canActivate: [AuthGuard] },
    { path: 'edit-animal/:id', component: EditAnimalComponent, canActivate: [AuthGuard] },
    { path: 'profile', component: UserProfileComponent, canActivate: [AuthGuard] }, 
    { path: 'animals/:id/health-records', component: HealthComponent }, 
    { path: 'animals/:id/add-health-record', component: AddHealthComponent },
    { path: '**', redirectTo: '/animals' },
];