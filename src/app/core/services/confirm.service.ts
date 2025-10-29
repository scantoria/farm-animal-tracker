// src/app/core/services/confirm.service.ts

import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ConfirmService {

  constructor() { }

  /**
   * Prompts the user with a confirmation dialog.
   * NOTE: This implementation uses the basic browser 'confirm' function.
   * In a production application, replace this with an Angular Modal solution 
   * (e.g., using MatDialog or a custom component) for a better UX.
   * * @param title The title of the dialog (not used by browser confirm).
   * @param message The message to display to the user.
   * @returns An Observable<boolean> that emits true if the user confirms, false otherwise.
   */
  confirm(title: string, message: string): Observable<boolean> {
    // We use a small delay to ensure the browser confirm does not block 
    // any synchronous UI updates that might be happening.
    const result = window.confirm(`${title}\n\n${message}`);
    return of(result).pipe(delay(0));
  }
}