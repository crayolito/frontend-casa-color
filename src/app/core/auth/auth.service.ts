import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, map, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'casa_color_admin_token';
const EMAIL_KEY = 'casa_color_admin_email';

export interface AuthSession {
  accessToken: string;
  email: string;
}

interface LoginResponseEnvelope {
  data: {
    accessToken: string;
    expiresIn: string;
  };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly sessionSignal = signal<AuthSession | null>(this.readStoredSession());

  readonly session = this.sessionSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.sessionSignal() !== null);
  readonly email = computed(() => this.sessionSignal()?.email ?? null);
  readonly accessToken = computed(() => this.sessionSignal()?.accessToken ?? null);

  login(email: string, password: string): Observable<AuthSession> {
    return this.http
      .post<LoginResponseEnvelope>(`${environment.apiUrl}/auth/login`, {
        email,
        password,
      })
      .pipe(
        map((res) => ({
          accessToken: res.data.accessToken,
          email: email.toLowerCase(),
        })),
        tap((session) => this.persist(session)),
      );
  }

  logout(redirectToLogin = true): void {
    this.clear();
    if (redirectToLogin) {
      void this.router.navigateByUrl('/admin/login');
    }
  }

  private persist(session: AuthSession): void {
    sessionStorage.setItem(TOKEN_KEY, session.accessToken);
    sessionStorage.setItem(EMAIL_KEY, session.email);
    this.sessionSignal.set(session);
  }

  private clear(): void {
    sessionStorage.removeItem(TOKEN_KEY);
    sessionStorage.removeItem(EMAIL_KEY);
    this.sessionSignal.set(null);
  }

  private readStoredSession(): AuthSession | null {
    const accessToken = sessionStorage.getItem(TOKEN_KEY);
    const email = sessionStorage.getItem(EMAIL_KEY);
    if (!accessToken || !email) {
      return null;
    }
    return { accessToken, email };
  }
}
