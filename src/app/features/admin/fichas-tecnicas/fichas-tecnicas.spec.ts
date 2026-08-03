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
                  {
                    id: 1,
                    name: 'Decoración',
                    slug: 'decoracion',
                    cardImageUrl: '/img/deco.jpg',
                    coverImageUrl: null,
                  },
                  {
                    id: 2,
                    name: 'Industria',
                    slug: 'industria',
                    cardImageUrl: '/img/ind.jpg',
                    coverImageUrl: null,
                  },
                  {
                    id: 3,
                    name: 'Arte',
                    slug: 'arte',
                    cardImageUrl: null,
                    coverImageUrl: null,
                  },
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

  it('renders 3 static cards for FormArray categories', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelectorAll('.fichas-admin__card').length).toBe(3);
    expect(el.querySelectorAll('.fichas-admin__chevron').length).toBe(0);
    expect(el.querySelector('app-admin-modal')).toBeNull();
    expect(el.textContent).toContain('Decoración');
    expect(el.querySelector('[aria-label="Editar"]')).toBeTruthy();
  });

  it('opens edit modal with only category select', () => {
    const cmp = fixture.componentInstance;
    cmp.openEditCategory(0);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(cmp.categoryModalOpen()).toBe(true);
    expect(el.querySelector('app-admin-modal')).toBeTruthy();
    expect(el.querySelector('app-select')).toBeTruthy();
    expect(el.textContent).not.toContain('Etiqueta visible');
    expect(el.textContent).not.toContain('Imagen de la tarjeta');
  });

  it('save derives label and imageUrl from selected category', () => {
    const cmp = fixture.componentInstance;
    cmp.save();
    expect(upsertSpy).toHaveBeenCalled();
    const body = upsertSpy.mock.calls[0][0];
    expect(body.heading).toBe('Fichas Técnicas');
    expect(body.categories).toHaveLength(3);
    expect(body.categories[0]).toMatchObject({
      categoryId: 1,
      label: 'Decoración',
      imageUrl: '/img/deco.jpg',
    });
    expect(body.categories[2]).toMatchObject({
      categoryId: 3,
      label: 'Arte',
      imageUrl: null,
    });
  });
});
