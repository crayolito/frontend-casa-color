import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AdminProductsList } from './products-list';
import { environment } from '../../../../../environments/environment';
import { Product } from '../../data/admin.models';

const emptyMeta = { page: 1, limit: 16, total: 0, totalPages: 0 };

function product(partial: Partial<Product> & { id: number; title: string }): Product {
  return {
    catalogId: 1,
    catalogs: [{ id: 1, name: 'Cat', categoryId: 1, categoryName: 'Pinturas' }],
    slug: partial.title.toLowerCase(),
    description: null,
    mainImageUrl: null,
    technicalSheetUrl: null,
    isActive: true,
    displayOrder: 0,
    createdAt: '',
    updatedAt: '',
    presentations: [],
    finishes: [],
    colors: [],
    colorsCount: 0,
    sections: [],
    images: [],
    ...partial,
  };
}

describe('AdminProductsList', () => {
  let fixture: ComponentFixture<AdminProductsList>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminProductsList],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'admin/products', children: [] },
          { path: 'admin/products/new', children: [] },
        ]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminProductsList);
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => {
    http.verify();
  });

  function flushBoot(products: Product[] = []): void {
    const reqs = http.match(
      (r) =>
        r.url.startsWith(`${environment.apiUrl}/admin/products`) ||
        r.url.startsWith(`${environment.apiUrl}/public/categories`) ||
        r.url.startsWith(`${environment.apiUrl}/public/catalogs`),
    );
    for (const r of reqs) {
      const isProducts = r.request.url.includes('/admin/products');
      const isCategories = r.request.url.includes('/public/categories');
      r.flush(
        isProducts
          ? {
              data: products,
              meta: {
                page: 1,
                limit: 16,
                total: products.length,
                totalPages: products.length ? 1 : 0,
              },
            }
          : isCategories
            ? {
                data: [
                  {
                    id: 1,
                    name: 'Pinturas',
                    slug: 'pinturas',
                    shortDescription: null,
                    description: null,
                    imageUrl: null,
                    displayOrder: 0,
                    createdAt: '',
                    updatedAt: '',
                  },
                ],
                meta: { page: 1, limit: 100, total: 1, totalPages: 1 },
              }
            : {
                data: [],
                meta: { page: 1, limit: 100, total: 0, totalPages: 0 },
              },
      );
    }
  }

  it('creates and triggers initial list + categories load', () => {
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();
    flushBoot();
  });

  it('debounces search input (300ms) before querying', async () => {
    const component = fixture.componentInstance;
    flushBoot();

    component.onSearchInput('lata');
    expect(component.search()).toBe('lata');

    await new Promise((resolve) => setTimeout(resolve, 350));

    const searched = http.expectOne(
      (r) =>
        r.url.startsWith(`${environment.apiUrl}/admin/products`) &&
        r.params.get('search') === 'lata',
    );
    searched.flush({
      data: [product({ id: 5, title: 'Látex' })],
      meta: { page: 1, limit: 16, total: 1, totalPages: 1 },
    });
    await fixture.whenStable();

    expect(component.rows().length).toBe(1);
    expect(component.meta()?.total).toBe(1);
  });

  it('supports selection and bulk deactivate', async () => {
    const component = fixture.componentInstance;
    flushBoot([
      product({ id: 1, title: 'A', isActive: true }),
      product({ id: 2, title: 'B', isActive: true }),
    ]);
    await fixture.whenStable();

    component.onSelectionChange(new Set([1, 2]));
    expect(component.selectedCount()).toBe(2);

    component.bulkSetActive(false);

    const patches = http.match(
      (r) =>
        r.method === 'PATCH' &&
        r.url.startsWith(`${environment.apiUrl}/admin/products/`),
    );
    expect(patches.length).toBe(2);
    for (const req of patches) {
      expect(req.request.body).toEqual({ isActive: false });
      const id = Number(req.request.url.split('/').pop());
      req.flush({
        data: product({ id, title: id === 1 ? 'A' : 'B', isActive: false }),
      });
    }
    await fixture.whenStable();

    expect(component.selectedCount()).toBe(0);
    expect(component.flash()).toContain('desactivado');
  });

  it('clears selection when page changes', async () => {
    const component = fixture.componentInstance;
    flushBoot([product({ id: 1, title: 'A' })]);
    await fixture.whenStable();

    component.onSelectionChange(new Set([1]));
    expect(component.selectedCount()).toBe(1);

    component.onPageChange(2);
    expect(component.selectedCount()).toBe(0);

    const pageReqs = http.match((r) =>
      r.url.startsWith(`${environment.apiUrl}/admin/products`),
    );
    for (const req of pageReqs) {
      req.flush({ data: [], meta: emptyMeta });
    }
  });

  it('toggles active via cellClick on Estado', async () => {
    const component = fixture.componentInstance;
    flushBoot();
    const row = product({ id: 3, title: 'C', isActive: true });
    component.rows.set([row]);

    component.onCellClick({ row, key: 'active' });

    const patch = http.expectOne(
      (r) =>
        r.method === 'PATCH' &&
        r.url === `${environment.apiUrl}/admin/products/3`,
    );
    expect(patch.request.body).toEqual({ isActive: false });
    patch.flush({ data: { ...row, isActive: false } });
    await fixture.whenStable();

    expect(component.rows()[0].isActive).toBe(false);
    expect(component.flash()).toContain('desactivado');
  });

  it('opens catalog modal via cellAction', async () => {
    const component = fixture.componentInstance;
    const row = product({
      id: 4,
      title: 'D',
      catalogs: [
        { id: 1, name: 'Cat A', categoryId: 1, categoryName: 'Pinturas' },
        { id: 2, name: 'Cat B', categoryId: 1, categoryName: 'Pinturas' },
      ],
    });
    flushBoot([row]);
    await fixture.whenStable();

    expect(component.catalogCount(row)).toBe(2);
    expect(component.categoryCount(row)).toBe(1);

    component.onCellAction({ row, key: 'catalog' });
    expect(component.detailModal()?.kind).toBe('catalog');
    expect(component.detailModal()?.items.length).toBe(2);

    component.onCellAction({ row, key: 'category' });
    expect(component.detailModal()?.kind).toBe('category');
    expect(component.detailModal()?.items.length).toBe(1);
    expect(component.detailModal()?.items[0].name).toBe('Pinturas');

    component.closeDetailModal();
    expect(component.detailModal()).toBeNull();
  });
});
