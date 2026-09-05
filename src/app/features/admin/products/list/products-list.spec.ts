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
import { AdminToastService } from '../../../../shared/admin-ui/admin-toast/admin-toast.service';

const emptyMeta = { page: 1, limit: 25, total: 0, totalPages: 0 };

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
  let toast: AdminToastService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminProductsList],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([
          { path: 'ccadm/products', children: [] },
          { path: 'ccadm/products/new', children: [] },
        ]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminProductsList);
    http = TestBed.inject(HttpTestingController);
    toast = TestBed.inject(AdminToastService);
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
                limit: 25,
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
                    description: null,
                    description2: null,
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
      meta: { page: 1, limit: 25, total: 1, totalPages: 1 },
    });
    await fixture.whenStable();

    expect(component.rows().length).toBe(1);
    expect(component.meta()?.total).toBe(1);
  });

  it('filters inactive products via isActive=false query param', async () => {
    const component = fixture.componentInstance;
    flushBoot();
    await fixture.whenStable();

    component.onActiveChange('false');
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve, 350));

    expect(component.isActive()).toBe(false);

    const filtered = http.expectOne(
      (r) =>
        r.url.startsWith(`${environment.apiUrl}/admin/products`) &&
        r.params.get('isActive') === 'false',
    );
    filtered.flush({
      data: [product({ id: 9, title: 'Off', isActive: false })],
      meta: { page: 1, limit: 25, total: 1, totalPages: 1 },
    });
    await fixture.whenStable();

    expect(component.isActive()).toBe(false);
    expect(component.rows()[0].isActive).toBe(false);
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
    expect(toast.toasts().some((t) => t.message.includes('desactivado'))).toBe(true);
  });

  it('keeps selection when page changes', async () => {
    const component = fixture.componentInstance;
    flushBoot([product({ id: 1, title: 'A' })]);
    await fixture.whenStable();

    component.onSelectionChange(new Set([1]));
    expect(component.selectedCount()).toBe(1);

    component.onPageChange(2);
    expect(component.selectedCount()).toBe(1);

    const pageReqs = http.match((r) =>
      r.url.startsWith(`${environment.apiUrl}/admin/products`),
    );
    for (const req of pageReqs) {
      req.flush({ data: [], meta: emptyMeta });
    }
  });

  it('bulk deletes selected products', async () => {
    const component = fixture.componentInstance;
    flushBoot([
      product({ id: 1, title: 'A' }),
      product({ id: 2, title: 'B' }),
    ]);
    await fixture.whenStable();

    component.onSelectionChange(new Set([1, 2]));
    component.askBulkDelete();
    component.confirmBulkDelete();

    const deletes = http.match(
      (r) =>
        r.method === 'DELETE' &&
        r.url.startsWith(`${environment.apiUrl}/admin/products/`),
    );
    expect(deletes.length).toBe(2);
    for (const req of deletes) {
      req.flush(null);
    }
    await fixture.whenStable();

    const reload = http.match((r) =>
      r.url.startsWith(`${environment.apiUrl}/admin/products`),
    );
    for (const req of reload) {
      if (req.request.method === 'GET') {
        req.flush({ data: [], meta: emptyMeta });
      }
    }
    expect(component.selectedCount()).toBe(0);
    expect(toast.toasts().some((t) => t.message.includes('eliminado'))).toBe(
      true,
    );
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
    expect(toast.toasts().some((t) => t.message.includes('desactivado'))).toBe(true);
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
      colors: [
        { id: 10, name: 'Rojo', hexCode: '#ff0000', imageUrl: null, displayOrder: 0 },
      ],
      finishes: [{ id: 20, name: 'Mate', imageUrl: null, displayOrder: 0 }],
    });
    flushBoot();
    component.rows.set([row]);

    expect(component.catalogCount(row)).toBe(2);

    component.onCellAction({ row, key: 'catalog' });
    expect(component.detailModal()?.kind).toBe('catalog');
    expect(component.detailModal()?.items.length).toBe(2);

    component.onCellAction({ row, key: 'colors' });
    expect(component.detailModal()?.kind).toBe('colors');
    expect(component.detailModal()?.items[0].hex).toBe('#ff0000');

    component.onCellAction({ row, key: 'finishes' });
    expect(component.detailModal()?.kind).toBe('finishes');
    expect(component.detailModal()?.items[0].name).toBe('Mate');

    component.closeDetailModal();
    expect(component.detailModal()).toBeNull();
  });

  it('desasigna un catálogo desde el modal de detalle y actualiza la fila', async () => {
    const component = fixture.componentInstance;
    const row = product({
      id: 9,
      title: 'I',
      catalogs: [
        { id: 1, name: 'Cat A', categoryId: 1, categoryName: 'Pinturas' },
        { id: 2, name: 'Cat B', categoryId: 1, categoryName: 'Pinturas' },
      ],
    });
    flushBoot();
    component.rows.set([row]);
    component.onCellAction({ row, key: 'catalog' });

    const modal = component.detailModal()!;
    expect(component.detailItemCanRemove(modal.items[0])).toBe(true);

    component.removeDetailItem(modal.items[0]);

    const patch = http.expectOne(
      (r) =>
        r.method === 'PATCH' &&
        r.url === `${environment.apiUrl}/admin/products/9`,
    );
    expect(patch.request.body).toEqual({ catalogIds: [2] });
    patch.flush({
      data: {
        ...row,
        catalogs: [{ id: 2, name: 'Cat B', categoryId: 1, categoryName: 'Pinturas' }],
      },
    });
    await fixture.whenStable();

    expect(component.detailModal()?.items.length).toBe(1);
    expect(component.rows()[0].catalogs.length).toBe(1);
  });

  it('permite desasignar el único catálogo y deja el producto suelto', async () => {
    const component = fixture.componentInstance;
    const row = product({
      id: 10,
      title: 'J',
      catalogs: [
        { id: 1, name: 'Cat A', categoryId: 1, categoryName: 'Pinturas' },
      ],
    });
    flushBoot();
    component.rows.set([row]);
    component.onCellAction({ row, key: 'catalog' });

    const modal = component.detailModal()!;
    expect(component.detailItemCanRemove(modal.items[0])).toBe(true);

    component.removeDetailItem(modal.items[0]);

    const patch = http.expectOne(
      (r) =>
        r.method === 'PATCH' &&
        r.url === `${environment.apiUrl}/admin/products/10`,
    );
    expect(patch.request.body).toEqual({ catalogIds: [] });
    patch.flush({
      data: { ...row, catalogs: [] },
    });
    await fixture.whenStable();

    expect(component.detailModal()?.items.length).toBe(0);
    expect(component.rows()[0].catalogs.length).toBe(0);
  });

  it('deriva la imagen del listado desde images con fallback a mainImageUrl', () => {
    const component = fixture.componentInstance;
    flushBoot();
    const imageCol = component.columns.find((c) => c.key === 'image');

    const withMain = product({
      id: 50,
      title: 'Con principal',
      images: [
        { id: 1, url: '/main.jpg', publicId: 'p1', isMain: true, displayOrder: 0 },
        { id: 2, url: '/second.jpg', publicId: 'p2', isMain: false, displayOrder: 1 },
      ],
    });
    expect(imageCol?.image?.(withMain)).toBe('/main.jpg');

    const noMainFlag = product({
      id: 51,
      title: 'Sin flag',
      images: [
        { id: 3, url: '/first.jpg', publicId: 'p3', isMain: false, displayOrder: 0 },
      ],
    });
    expect(imageCol?.image?.(noMainFlag)).toBe('/first.jpg');

    const onlyLegacy = product({
      id: 52,
      title: 'Legacy',
      mainImageUrl: '/legacy.jpg',
    });
    expect(imageCol?.image?.(onlyLegacy)).toBe('/legacy.jpg');
  });
});
