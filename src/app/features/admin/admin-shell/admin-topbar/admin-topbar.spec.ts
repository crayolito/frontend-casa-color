import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { signal } from '@angular/core';
import { AuthService } from '../../../../core/auth/auth.service';
import { AdminFormContext } from '../../../../shared/admin-ui/admin-form-context/admin-form-context';
import { AdminSearchApi } from '../../data/admin-search.api';
import { AdminTopbar } from './admin-topbar';
import { of } from 'rxjs';

describe('AdminTopbar', () => {
  let fixture: ComponentFixture<AdminTopbar>;
  let formCtx: AdminFormContext;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminTopbar],
      providers: [
        provideRouter([]),
        AdminFormContext,
        {
          provide: AuthService,
          useValue: {
            email: () => 'admin@test.com',
            logout: () => undefined,
          },
        },
        {
          provide: AdminSearchApi,
          useValue: {
            search: () =>
              of({ products: [], catalogs: [], categories: [] }),
          },
        },
      ],
    }).compileComponents();
    formCtx = TestBed.inject(AdminFormContext);
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

  it('shows Guardar/Descartar in search slot when form is dirty', () => {
    const dirty = signal(true);
    const saving = signal(false);
    const save = vi.fn();
    const discard = vi.fn();

    TestBed.runInInjectionContext(() => {
      formCtx.register(
        {
          dirty,
          saving,
          save,
          discard,
        },
        { onDestroy: () => () => undefined } as never,
      );
    });
    TestBed.flushEffects();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.admin-topbar__search')).toBeNull();
    expect(el.querySelector('.admin-topbar__dirty')).toBeTruthy();
    expect(el.textContent).toContain('Sin guardar');
    expect(el.textContent).toContain('Guardar');
    expect(el.textContent).toContain('Descartar');
  });
});
