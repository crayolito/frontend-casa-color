import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, ActivatedRoute, convertToParamMap } from '@angular/router';
import { of, throwError, BehaviorSubject } from 'rxjs';
import { PublicProduct, ProductsPublicApi } from '../../../core/http/products-public.api';
import { Producto } from './producto';

const SAMPLE: PublicProduct = {
  id: 1,
  catalogId: 10,
  catalogs: [
    {
      id: 10,
      name: 'Pintura mate',
      slug: 'pintura-mate',
      categoryId: 2,
      categoryName: 'Línea Deco',
      categorySlug: 'linea-deco',
    },
  ],
  title: 'Acrílico color',
  slug: 'acrilico-color',
  description: '<p>Desc</p>',
  mainImageUrl: null,
  technicalSheetUrl: null,
  isActive: true,
  displayOrder: 0,
  presentations: [{ id: 1, value: '1 L', displayOrder: 0 }],
  finishes: [],
  colors: [],
  sections: [],
  images: [
    {
      id: 1,
      url: '/img/productos/envase.jpg',
      publicId: 'x',
      isMain: true,
      displayOrder: 0,
    },
  ],
};

describe('Producto', () => {
  async function setup(opts?: { error?: boolean; slug?: string }) {
    const slug$ = new BehaviorSubject(
      convertToParamMap({ slug: opts?.slug ?? 'acrilico-color' }),
    );
    const api = {
      getBySlug: (slug: string) =>
        opts?.error
          ? throwError(() => ({ status: 404, error: { code: 'PRODUCT_NOT_FOUND' } }))
          : of({ ...SAMPLE, slug }),
      list: () =>
        of({
          data: [
            SAMPLE,
            { ...SAMPLE, id: 2, slug: 'satinada', title: 'Satinada' },
          ],
          meta: { page: 1, limit: 5, total: 2, totalPages: 1 },
        }),
    };

    await TestBed.configureTestingModule({
      imports: [Producto],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: ProductsPublicApi, useValue: api },
        {
          provide: ActivatedRoute,
          useValue: {
            paramMap: slug$.asObservable(),
            snapshot: {
              paramMap: {
                get: (key: string) =>
                  key === 'slug' ? (opts?.slug ?? 'acrilico-color') : null,
              },
            },
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(Producto);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return { fixture };
  }

  it('carga producto por slug y muestra el título', async () => {
    const { fixture } = await setup();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Acrílico color');
    expect(el.textContent).toContain('1 L');
    expect(el.textContent).toContain('Productos relacionados');
    expect(el.textContent).toContain('Satinada');
  });

  it('muestra error con reintentar cuando falla la carga', async () => {
    const { fixture } = await setup({ error: true });
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.producto__status--error')).toBeTruthy();
    expect(el.querySelector('.producto__retry')).toBeTruthy();
  });
});
