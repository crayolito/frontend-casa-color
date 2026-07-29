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
    heroImageUrl: '/img/slides/linea-deco-imagen-destacada.jpg',
    heading: 'Fichas Técnicas',
    categories: [
      {
        categoryId: 1,
        label: 'Línea Deco',
        imageUrl: '/img/logos/logo-linea-deco.jpg',
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
        imageUrl: '/img/logos/logo-linea-tecno.jpg',
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
        imageUrl: '/img/logos/logo-linea-art.jpg',
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

  it('renders category cards and catalogs of the selected category', async () => {
    const fixture = await setup();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('.fichas__card').length).toBe(3);
    expect(compiled.querySelectorAll('app-fichas-toggle').length).toBe(1);
    const links = Array.from(
      compiled.querySelectorAll('.fichas-column__links a'),
    ) as HTMLAnchorElement[];
    expect(links.map((a) => a.textContent?.trim())).toEqual([
      'EMI-25',
      'Acrílico',
    ]);
    expect(links[0].getAttribute('href')).toBe('/fichas/emi-25.pdf');
    expect(links[0].getAttribute('target')).toBe('_blank');
  });

  it('switches catalogs when clicking another category card', async () => {
    const fixture = await setup();
    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll(
      '.fichas__card',
    ) as NodeListOf<HTMLButtonElement>;
    cards[1].click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const links = Array.from(
      compiled.querySelectorAll('.fichas-column__links a'),
    ) as HTMLAnchorElement[];
    expect(links.map((a) => a.textContent?.trim())).toEqual(['Shop primer']);
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
    expect(compiled.querySelectorAll('.fichas__card').length).toBe(3);
  });
});
