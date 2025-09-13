import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';
import { SignupComponent } from './auth/signup/signup.component';
import { HomeComponent } from './home/home.component';
import { AddAnimalComponent } from './add-animal/add-animal.component';
import { EditAnimalComponent } from './edit-animal/edit-animal.component';
import { AuthGuard } from './auth/auth.guard';
import { UserProfileComponent } from './user-profile/user-profile.component';
import { HealthRecordsComponent } from './animals/health-records/health-records.component';
import { AddHealthRecordComponent } from './animals/add-health-record/add-health-record.component';

export const routes: Routes = [
    { path: '', component: HomeComponent, canActivate: [AuthGuard] },
    { path: 'login', component: LoginComponent },
    { path: 'signup', component: SignupComponent },
    { path: 'add-animal', component: AddAnimalComponent, canActivate: [AuthGuard] },
    { path: 'edit-animal/:id', component: EditAnimalComponent, canActivate: [AuthGuard] },
    { path: 'profile', component: UserProfileComponent, canActivate: [AuthGuard] }, 
    { path: 'animals/:id/health-records', component: HealthRecordsComponent }, 
    { path: 'animals/:id/add-health-record', component: AddHealthRecordComponent },
    { path: '**', redirectTo: '/animals' },
];