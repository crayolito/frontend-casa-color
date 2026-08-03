import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { FichasTecnicasPublic } from '../../admin/data/admin.models';
import { FichasTecnicasApi } from '../../admin/data/fichas-tecnicas.api';
import { FichasTecnicas } from './fichas-tecnicas';

function makePayload(
  overrides?: Partial<FichasTecnicasPublic>,
): FichasTecnicasPublic {
  return {
    heroImageUrl: '/img/img-auxiliar2.jpg',
    heading: 'Fichas Técnicas',
    categories: [
      {
        categoryId: 1,
        label: 'Línea Deco',
        imageUrl: '/img/img-auxiliar.jpg',
        slug: 'deco',
        name: 'Deco',
        catalogs: [
          {
            id: 10,
            name: 'PINTURA MATE Y DECORATIVA',
            slug: 'mate',
            products: [
              {
                id: 100,
                title: 'EMI-25',
                slug: 'emi-25',
                technicalSheetUrl: '/fichas/emi-25.pdf',
              },
              {
                id: 101,
                title: 'Acrílico',
                slug: 'acrilico',
                technicalSheetUrl: '/fichas/acrilico.pdf',
              },
            ],
          },
        ],
      },
      {
        categoryId: 2,
        label: 'Línea Tecno',
        imageUrl: '/img/img-auxiliar.jpg',
        slug: 'tecno',
        name: 'Tecno',
        catalogs: [
          {
            id: 20,
            name: 'IMPRIMACIONES',
            slug: 'imprimaciones',
            products: [
              {
                id: 200,
                title: 'Shop primer',
                slug: 'shop-primer',
                technicalSheetUrl: '/fichas/shop-primer.pdf',
              },
            ],
          },
        ],
      },
      {
        categoryId: 3,
        label: 'Línea Art',
        imageUrl: '/img/img-auxiliar.jpg',
        slug: 'art',
        name: 'Art',
        catalogs: [],
      },
    ],
    ...overrides,
  };
}

describe('FichasTecnicas', () => {
  let getPublicSpy: ReturnType<typeof vi.fn>;

  async function setup(opts?: {
    payload?: FichasTecnicasPublic;
    error?: boolean;
  }): Promise<ComponentFixture<FichasTecnicas>> {
    const payload = opts?.payload ?? makePayload();

    getPublicSpy = vi.fn(() =>
      opts?.error
        ? throwError(() => ({
            status: 500,
            code: 'INTERNAL_ERROR',
            message: 'Error interno',
            correlationId: 'corr-fichas',
          }))
        : of(payload),
    );

    await TestBed.configureTestingModule({
      imports: [FichasTecnicas],
      providers: [
        { provide: FichasTecnicasApi, useValue: { getPublic: getPublicSpy } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(FichasTecnicas);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  it('should create and render title', async () => {
    const fixture = await setup();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(fixture.componentInstance).toBeTruthy();
    expect(compiled.querySelector('.fichas__title')).toBeTruthy();
  });

  it('loads from FichasTecnicasApi.getPublic and shows heading', async () => {
    const fixture = await setup();
    expect(getPublicSpy).toHaveBeenCalled();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.fichas__title')?.textContent?.trim()).toBe(
      'Fichas Técnicas',
    );
  });

  it('renders all category columns with logos and catalogs', async () => {
    const fixture = await setup();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('.fichas__column').length).toBe(3);
    expect(compiled.querySelectorAll('app-fichas-column').length).toBe(3);
    expect(compiled.querySelectorAll('.fichas-column__logo').length).toBe(3);
    expect(compiled.querySelectorAll('app-fichas-toggle').length).toBe(2);

    const firstColumn = compiled.querySelector(
      '.fichas__column',
    ) as HTMLElement;
    const links = Array.from(
      firstColumn.querySelectorAll('.fichas-column__links a'),
    ) as HTMLAnchorElement[];
    expect(links.map((a) => a.textContent?.trim())).toEqual([
      'EMI-25',
      'Acrílico',
    ]);
    expect(links[0].getAttribute('href')).toBe('/fichas/emi-25.pdf');
    expect(links[0].getAttribute('target')).toBe('_blank');

    const columns = compiled.querySelectorAll('.fichas__column');
    const emptyCol = columns[2] as HTMLElement;
    expect(emptyCol.querySelector('.fichas-column__empty')?.textContent).toContain(
      'Sin fichas técnicas en esta categoría',
    );
    expect(emptyCol.querySelectorAll('app-fichas-toggle').length).toBe(0);
  });

  it('shows catalog toggles even when they have no PDF products', async () => {
    const fixture = await setup({
      payload: makePayload({
        categories: [
          {
            categoryId: 1,
            label: 'Línea Deco',
            imageUrl: '/img/img-auxiliar.jpg',
            slug: 'deco',
            name: 'Deco',
            catalogs: [
              {
                id: 10,
                name: 'PINTURA MATE',
                slug: 'mate',
                products: [],
              },
              {
                id: 11,
                name: 'ESMALTES',
                slug: 'esmaltes',
                products: [
                  {
                    id: 100,
                    title: 'EMI-25',
                    slug: 'emi-25',
                    technicalSheetUrl: '/fichas/emi-25.pdf',
                  },
                ],
              },
            ],
          },
        ],
      }),
    });
    const compiled = fixture.nativeElement as HTMLElement;
    const toggles = compiled.querySelectorAll('app-fichas-toggle');
    expect(toggles.length).toBe(2);
    expect(toggles[0].textContent).toContain('PINTURA MATE');
    expect(toggles[1].textContent).toContain('ESMALTES');
  });

  it('shows empty state when API returns no categories', async () => {
    const fixture = await setup({
      payload: makePayload({ categories: [] }),
    });
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.fichas__status')?.textContent).toContain(
      'Todavía no hay fichas',
    );
  });

  it('shows error state and allows retry', async () => {
    const fixture = await setup({ error: true });
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.fichas__error')).toBeTruthy();
    expect(compiled.querySelector('.fichas__retry')).toBeTruthy();

    getPublicSpy.mockReturnValueOnce(of(makePayload()));
    compiled.querySelector('.fichas__retry')?.dispatchEvent(new Event('click'));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(getPublicSpy).toHaveBeenCalledTimes(2);
    expect(compiled.querySelectorAll('.fichas__column').length).toBe(3);
  });
});
