// src/app/shared/models/user.model.ts
import { Timestamp } from '@angular/fire/firestore';

export interface User {
    id?: string;
    email: string;
    name: string; // Used for display, e.g., 'Jane Doe'
    role: 'Admin' | 'User' | 'Viewer'; // Define roles explicitly
    createdAt?: Date | Timestamp;
    lastLogin?: Date | Timestamp;
}