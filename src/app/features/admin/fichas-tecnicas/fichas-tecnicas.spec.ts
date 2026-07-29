import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { CategoriesApi } from '../data/categories.api';
import { FichasTecnicasApi } from '../data/fichas-tecnicas.api';
import { SiteSettingsApi } from '../data/site-settings.api';
import { AdminFichasTecnicas } from './fichas-tecnicas';

describe('AdminFichasTecnicas', () => {
  let fixture: ComponentFixture<AdminFichasTecnicas>;
  let upsertSpy: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    upsertSpy = vi.fn(() => of({ ok: true }));

    await TestBed.configureTestingModule({
      imports: [AdminFichasTecnicas],
      providers: [
        {
          provide: CategoriesApi,
          useValue: {
            list: () =>
              of({
                data: [
                  { id: 1, name: 'Decoración', slug: 'decoracion' },
                  { id: 2, name: 'Industria', slug: 'industria' },
                  { id: 3, name: 'Arte', slug: 'arte' },
                ],
                meta: { page: 1, limit: 100, total: 3, totalPages: 1 },
              }),
          },
        },
        {
          provide: SiteSettingsApi,
          useValue: {
            get: () =>
              of({
                key: 'fichas_tecnicas',
                value: {
                  heading: 'Fichas Técnicas',
                  heroImageUrl: null,
                  categories: [
                    { categoryId: 1, label: 'Decoración', imageUrl: null },
                    { categoryId: 2, label: 'Industria', imageUrl: null },
                    { categoryId: 3, label: 'Arte', imageUrl: null },
                  ],
                },
              }),
          },
        },
        {
          provide: FichasTecnicasApi,
          useValue: { upsert: upsertSpy },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminFichasTecnicas);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  it('renders 3 collapsible cards for FormArray categories', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('.fichas-admin__card').length).toBe(3);
    expect(el.querySelectorAll('app-accordion').length).toBe(0);
    expect(el.textContent).toContain('Decoración');
  });

  it('keeps form bindings when editing label', () => {
    const cmp = fixture.componentInstance;
    cmp.categoryGroup(0).patchValue({ label: 'Nueva etiqueta' });
    fixture.detectChanges();
    expect(cmp.categoryGroup(0).value.label).toBe('Nueva etiqueta');
    expect(cmp.cardTitle(0)).toBe('Nueva etiqueta');
  });

  it('save sends same body shape', () => {
    const cmp = fixture.componentInstance;
    cmp.save();
    expect(upsertSpy).toHaveBeenCalled();
    const body = upsertSpy.mock.calls[0][0];
    expect(body.heading).toBe('Fichas Técnicas');
    expect(body.categories).toHaveLength(3);
    expect(body.categories[0]).toMatchObject({
      categoryId: 1,
      label: 'Decoración',
    });
  });
});
