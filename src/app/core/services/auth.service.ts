import { Injectable } from '@angular/core';
import { Auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, user } from '@angular/fire/auth';
import { from, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public currentUser$: Observable<any>;

  constructor(private auth: Auth) {
    this.currentUser$ = user(this.auth);
  }

  signUp(email: string, password: string): Observable<any> {
    return from(createUserWithEmailAndPassword(this.auth, email, password));
  }

  signIn(email: string, password: string): Observable<any> {
    return from(signInWithEmailAndPassword(this.auth, email, password));
  }

  signOut(): Observable<void> {
    return from(signOut(this.auth));
  }
}