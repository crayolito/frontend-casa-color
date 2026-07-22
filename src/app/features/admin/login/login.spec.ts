import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AdminLogin } from './login';
import { environment } from '../../../../environments/environment';
import { errorInterceptor } from '../../../core/http/error.interceptor';

describe('AdminLogin', () => {
  let fixture: ComponentFixture<AdminLogin>;
  let http: HttpTestingController;

  beforeEach(async () => {
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [AdminLogin],
      providers: [
        provideHttpClient(withInterceptors([errorInterceptor])),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'admin/products', children: [] },
          { path: 'admin/login', children: [] },
        ]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminLogin);
    http = TestBed.inject(HttpTestingController);
    await fixture.whenStable();
  });

  afterEach(() => {
    http.verify();
    sessionStorage.clear();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should login on valid submit (happy path)', async () => {
    const component = fixture.componentInstance;
    component.form.setValue({
      email: 'admin@test.com',
      password: 'password12345',
    });
    component.onSubmit();

    const req = http.expectOne(`${environment.apiUrl}/auth/login`);
    req.flush({ data: { accessToken: 'abc', expiresIn: '15m' } });
    await fixture.whenStable();

    expect(sessionStorage.getItem('casa_color_admin_token')).toBe('abc');
    expect(component.errorMessage()).toBeNull();
  });

  it('should show error on invalid credentials', async () => {
    const component = fixture.componentInstance;
    component.form.setValue({
      email: 'admin@test.com',
      password: 'password12345',
    });
    component.onSubmit();

    const req = http.expectOne(`${environment.apiUrl}/auth/login`);
    req.flush(
      { error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' } },
      { status: 401, statusText: 'Unauthorized' },
    );
    await fixture.whenStable();

    expect(component.submitting()).toBe(false);
    expect(component.errorMessage()).toBe('Credenciales inválidas');
  });
});
