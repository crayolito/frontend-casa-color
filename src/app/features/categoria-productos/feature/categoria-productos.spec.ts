import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  provideRouter,
  ActivatedRoute,
  convertToParamMap,
} from '@angular/router';
import { BehaviorSubject, of, throwError } from 'rxjs';
import {
  CategoriesPublicApi,
  PublicCategory,
} from '../../../core/http/categories-public.api';
import {
  ProductsPublicApi,
  PublicProduct,
} from '../../../core/http/products-public.api';
import {
  CategoriaProductos,
  applyFilters,
  extractFacets,
} from './categoria-productos';

const CATEGORY: PublicCategory = {
  id: 2,
  name: 'Línea Deco',
  slug: 'linea-deco',
  description: null,
  description2: null,
  imageUrl: null,
};

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
    mainImageUrl: null,
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

const PRODUCT_A = makeProduct({
  id: 1,
  slug: 'acrilico',
  title: 'Acrílico color',
  presentations: [{ id: 1, value: '1 L', displayOrder: 0 }],
  finishes: [{ id: 1, name: 'Mate', imageUrl: null, displayOrder: 0 }],
  colors: [
    { id: 1, name: 'Rojo', hexCode: '#ff0000', imageUrl: null, displayOrder: 0 },
  ],
});

const PRODUCT_B = makeProduct({
  id: 2,
  slug: 'esmalte',
  title: 'Esmalte sintético',
  presentations: [{ id: 2, value: '4 L', displayOrder: 0 }],
  finishes: [{ id: 2, name: 'Brillante', imageUrl: null, displayOrder: 0 }],
  colors: [
    { id: 2, name: 'Blanco', hexCode: '#ffffff', imageUrl: null, displayOrder: 0 },
  ],
});

describe('CategoriaProductos', () => {
  async function setup(opts?: {
    products?: PublicProduct[];
    error?: boolean;
    slug?: string;
  }) {
    const slug$ = new BehaviorSubject(
      convertToParamMap({ slug: opts?.slug ?? 'linea-deco' }),
    );
    const products = opts?.products ?? [PRODUCT_A, PRODUCT_B];

    const categoriesApi = {
      getBySlug: (slug: string) =>
        opts?.error
          ? throwError(() => ({
              status: 500,
              error: { code: 'INTERNAL_ERROR' },
            }))
          : of({ ...CATEGORY, slug }),
    };

    const productsApi = {
      list: () =>
        opts?.error
          ? throwError(() => ({
              status: 500,
              error: { code: 'INTERNAL_ERROR' },
            }))
          : of({
              data: products,
              meta: {
                page: 1,
                limit: 100,
                total: products.length,
                totalPages: 1,
              },
            }),
    };

    await TestBed.configureTestingModule({
      imports: [CategoriaProductos],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: CategoriesPublicApi, useValue: categoriesApi },
        { provide: ProductsPublicApi, useValue: productsApi },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: slug$.asObservable(),
            snapshot: {
              data: { archiveMode: 'category' },
              paramMap: {
                get: (key: string) =>
                  key === 'slug' ? (opts?.slug ?? 'linea-deco') : null,
              },
            },
            data: of({ archiveMode: 'category' }),
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(CategoriaProductos);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return { fixture };
  }

  it('carga productos de la categoría y renderiza cards', async () => {
    const { fixture } = await setup();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Línea Deco');
    expect(el.textContent).toContain('Acrílico color');
    expect(el.textContent).toContain('Esmalte sintético');
    const cards = el.querySelectorAll('app-product-card');
    expect(cards.length).toBe(2);
    expect(el.querySelector('app-select')).toBeTruthy();
  });

  it('muestra vacío cuando la categoría no tiene productos', async () => {
    const { fixture } = await setup({ products: [] });
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('todavía no tiene productos');
  });

  it('muestra error con reintentar cuando falla la carga', async () => {
    const { fixture } = await setup({ error: true });
    const el: HTMLElement = fixture.nativeElement;
    expect(
      el.querySelector('.categoria-productos__status--error'),
    ).toBeTruthy();
    expect(el.querySelector('.categoria-productos__retry')).toBeTruthy();
  });

  it('filtra por presentación al marcar el checkbox', async () => {
    const { fixture } = await setup();
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelectorAll('app-product-card').length).toBe(2);

    const labels = Array.from(
      el.querySelectorAll<HTMLLabelElement>('.categoria-productos__check'),
    );
    const oneLiterLabel = labels.find((label) =>
      label.textContent?.includes('1 L'),
    );
    expect(oneLiterLabel).toBeTruthy();
    const oneLiter = oneLiterLabel!.querySelector<HTMLInputElement>(
      'input[type="checkbox"]',
    );
    expect(oneLiter).toBeTruthy();
    oneLiter!.click();
    fixture.detectChanges();

    expect(oneLiter!.checked).toBe(true);
    expect(oneLiterLabel!.matches(':has(input:checked)')).toBe(true);
    expect(el.querySelectorAll('app-product-card').length).toBe(1);
    expect(el.textContent).toContain('Acrílico color');
    expect(el.textContent).not.toContain('Esmalte sintético');

    oneLiter!.click();
    fixture.detectChanges();
    expect(oneLiter!.checked).toBe(false);
    expect(el.querySelectorAll('app-product-card').length).toBe(2);
  });

  it('pagina de a 12 productos', async () => {
    const many = Array.from({ length: 15 }, (_, i) =>
      makeProduct({
        id: i + 1,
        slug: `prod-${i + 1}`,
        title: `Producto ${i + 1}`,
      }),
    );
    const { fixture } = await setup({ products: many });
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelectorAll('app-product-card').length).toBe(12);
    expect(el.querySelector('.categoria-productos__pagination')).toBeTruthy();

    const page2 = Array.from(
      el.querySelectorAll<HTMLButtonElement>('.categoria-productos__page-btn'),
    ).find((btn) => btn.textContent?.trim() === '2');
    expect(page2).toBeTruthy();
    page2!.click();
    fixture.detectChanges();

    expect(el.querySelectorAll('app-product-card').length).toBe(3);
    expect(el.textContent).toContain('Producto 13');
  });
});

describe('extractFacets / applyFilters', () => {
  it('extrae presentaciones, acabados y colores únicos', () => {
    const facets = extractFacets([PRODUCT_A, PRODUCT_B]);
    expect(facets.presentations).toEqual(['1 L', '4 L']);
    expect(facets.finishes).toEqual(['Brillante', 'Mate']);
    expect(facets.colors.map((c) => c.name)).toEqual(['Blanco', 'Rojo']);
  });

  it('aplica filtro de acabado y orden por nombre', () => {
    const filtered = applyFilters(
      [PRODUCT_A, PRODUCT_B],
      '',
      new Set(),
      new Set(['Mate']),
      new Set(),
      'name-asc',
    );
    expect(filtered.length).toBe(1);
    expect(filtered[0].title).toBe('Acrílico color');
  });
});
