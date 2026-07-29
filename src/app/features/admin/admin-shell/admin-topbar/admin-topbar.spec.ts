import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { AdminTopbar } from './admin-topbar';

describe('AdminTopbar', () => {
  let fixture: ComponentFixture<AdminTopbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminTopbar],
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            email: () => 'admin@test.com',
            logout: () => undefined,
          },
        },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(AdminTopbar);
    fixture.detectChanges();
  });

  it('renders search and logout without avatar or context crumb', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.admin-topbar__search')).toBeTruthy();
    expect(el.textContent).toContain('Salir');
    expect(el.querySelector('.admin-topbar__user')).toBeNull();
    expect(el.querySelector('.admin-topbar__avatar')).toBeNull();
    expect(el.querySelector('.admin-topbar__context')).toBeNull();
  });
});
