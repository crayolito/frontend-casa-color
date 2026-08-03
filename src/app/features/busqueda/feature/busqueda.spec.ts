import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  ActivatedRoute,
  convertToParamMap,
  provideRouter,
} from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { CatalogsPublicApi } from '../../../core/http/catalogs-public.api';
import { CategoriesPublicApi } from '../../../core/http/categories-public.api';
import {
  ProductsPublicApi,
  PublicProduct,
} from '../../../core/http/products-public.api';
import { Busqueda } from './busqueda';

function makeProduct(
  overrides: Partial<PublicProduct> & Pick<PublicProduct, 'id' | 'slug' | 'title'>,
): PublicProduct {
  return {
    catalogId: 10,
    catalogs: [
      {
        id: 10,
        name: 'Catálogo A',
        slug: 'catalogo-a',
        categoryId: 2,
        categoryName: 'Línea Deco',
        categorySlug: 'linea-deco',
      },
    ],
    description: null,
    mainImageUrl: '/img/img-auxiliar.jpg',
    technicalSheetUrl: null,
    isActive: true,
    displayOrder: 0,
    presentations: [],
    finishes: [],
    colors: [],
    sections: [],
    images: [],
    ...overrides,
  };
}

describe('Busqueda', () => {
  let queryParams$: BehaviorSubject<ReturnType<typeof convertToParamMap>>;
  let listSpy: ReturnType<typeof vi.fn>;
  let categoriesListSpy: ReturnType<typeof vi.fn>;
  let catalogsListSpy: ReturnType<typeof vi.fn>;

  async function setup(opts?: {
    q?: string;
    products?: PublicProduct[];
    total?: number;
    totalPages?: number;
    error?: boolean;
  }): Promise<ComponentFixture<Busqueda>> {
    queryParams$ = new BehaviorSubject(
      convertToParamMap(opts?.q ? { q: opts.q } : {}),
    );
    const products = opts?.products ?? [
      makeProduct({ id: 1, slug: 'acrilico', title: 'Acrílico Color' }),
      makeProduct({ id: 2, slug: 'esmalte', title: 'Esmalte sintético' }),
    ];
    const total = opts?.total ?? products.length;
    const totalPages = opts?.totalPages ?? 1;

    listSpy = vi.fn(() =>
      opts?.error
        ? throwError(() => ({
            status: 500,
            error: { code: 'INTERNAL_ERROR' },
          }))
        : of({
            data: products,
            meta: {
              page: 1,
              limit: 12,
              total,
              totalPages,
            },
          }),
    );

    categoriesListSpy = vi.fn(() =>
      of({
        data: [
          {
            id: 1,
            name: 'Decoración',
            slug: 'decoracion',
            description: null,
            description2: null,
            imageUrl: null,
          },
        ],
        meta: { page: 1, limit: 100, total: 1, totalPages: 1 },
      }),
    );
    catalogsListSpy = vi.fn(() =>
      of({
        data: [
          {
            id: 10,
            categoryId: 1,
            name: 'Línea Deco',
            slug: 'linea-deco',
            description: null,
            imageUrl: null,
            pdfUrl: null,
            pdfButtonLabel: 'PDF',
            extraCategoryIds: [],
            extraCategories: [],
          },
        ],
        meta: { page: 1, limit: 100, total: 1, totalPages: 1 },
      }),
    );

    await TestBed.configureTestingModule({
      imports: [Busqueda],
      providers: [
        provideRouter([]),
        {
          provide: ActivatedRoute,
          useValue: {
            queryParamMap: queryParams$.asObservable(),
            snapshot: { queryParamMap: queryParams$.value },
          },
        },
        {
          provide: ProductsPublicApi,
          useValue: { list: listSpy },
        },
        {
          provide: CategoriesPublicApi,
          useValue: { list: categoriesListSpy },
        },
        {
          provide: CatalogsPublicApi,
          useValue: { list: catalogsListSpy },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(Busqueda);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  it('should create and render page header', async () => {
    const fixture = await setup({ q: 'pintura' });
    const compiled = fixture.nativeElement as HTMLElement;
    expect(fixture.componentInstance).toBeTruthy();
    expect(compiled.querySelector('.busqueda__page-header')).toBeTruthy();
  });

  it('reads ?q= and shows ES title with search product cards', async () => {
    const fixture = await setup({ q: 'pintura' });
    expect(listSpy).toHaveBeenCalledWith({
      search: 'pintura',
      page: 1,
      limit: 12,
    });
    const compiled = fixture.nativeElement as HTMLElement;
    const h1 = compiled.querySelector('.busqueda__page-header h1')?.textContent ?? '';
    expect(h1).toContain('Resultados para');
    expect(h1).toContain('pintura');
    expect(compiled.querySelectorAll('app-search-product-card').length).toBeGreaterThanOrEqual(2);
    expect(compiled.querySelectorAll('app-product-card').length).toBe(0);
    expect(compiled.textContent).not.toContain('DOCUMENTACIÓN');
    expect(compiled.textContent).toContain('Decoración');
  });

  it('shows empty state when there are no results', async () => {
    const fixture = await setup({ q: 'xyz', products: [], total: 0 });
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.busqueda__status')?.textContent).toContain(
      'Sin resultados',
    );
  });

  it('shows prompt when q is missing', async () => {
    const fixture = await setup({});
    expect(listSpy).not.toHaveBeenCalled();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.busqueda__status')?.textContent).toContain(
      'ícono de búsqueda',
    );
  });

  it('shows error with retry', async () => {
    const fixture = await setup({ q: 'pintura', error: true });
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.busqueda__status--error')).toBeTruthy();
    expect(compiled.querySelector('.busqueda__retry')).toBeTruthy();
  });

  it('renders pagination and goToPage fetches next page', async () => {
    const fixture = await setup({
      q: 'pintura',
      products: [makeProduct({ id: 1, slug: 'a', title: 'A' })],
      total: 24,
      totalPages: 2,
    });
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.busqueda__pagination')).toBeTruthy();

    listSpy.mockReturnValue(
      of({
        data: [makeProduct({ id: 2, slug: 'b', title: 'B' })],
        meta: { page: 2, limit: 12, total: 24, totalPages: 2 },
      }),
    );

    const page2 = compiled.querySelectorAll<HTMLButtonElement>(
      '.busqueda__page-btn',
    );
    const btn2 = Array.from(page2).find((b) => b.textContent?.trim() === '2');
    expect(btn2).toBeTruthy();
    btn2!.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(listSpy).toHaveBeenCalledWith({
      search: 'pintura',
      page: 2,
      limit: 12,
    });
  });
});
