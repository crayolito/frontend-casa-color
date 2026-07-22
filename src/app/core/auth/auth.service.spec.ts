import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
      ],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    sessionStorage.clear();
  });

  it('should login and persist session', () => {
    let done = false;
    service.login('admin@test.com', 'password12345').subscribe((session) => {
      expect(session.accessToken).toBe('tok');
      expect(service.isAuthenticated()).toBe(true);
      expect(sessionStorage.getItem('casa_color_admin_token')).toBe('tok');
      done = true;
    });

    const req = http.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush({ data: { accessToken: 'tok', expiresIn: '15m' } });
    expect(done).toBe(true);
  });

  it('should clear session on logout', () => {
    service.login('admin@test.com', 'password12345').subscribe();
    http
      .expectOne(`${environment.apiUrl}/auth/login`)
      .flush({ data: { accessToken: 'tok', expiresIn: '15m' } });

    expect(service.isAuthenticated()).toBe(true);
    service.logout(false);
    expect(service.isAuthenticated()).toBe(false);
    expect(sessionStorage.getItem('casa_color_admin_token')).toBeNull();
  });
});
