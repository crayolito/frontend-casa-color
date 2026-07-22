import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AdminProductsList } from './products-list';
import { environment } from '../../../../../environments/environment';

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

  it('creates and triggers initial list + categories load', () => {
    const component = fixture.componentInstance;
    expect(component).toBeTruthy();

    const reqs = http.match(
      (r) =>
        r.url.startsWith(`${environment.apiUrl}/public/products`) ||
        r.url.startsWith(`${environment.apiUrl}/public/categories`) ||
        r.url.startsWith(`${environment.apiUrl}/public/catalogs`),
    );
    for (const r of reqs) {
      const isProducts = r.request.url.includes('/public/products');
      const isCategories = r.request.url.includes('/public/categories');
      r.flush(
        isProducts
          ? { data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } }
          : isCategories
            ? {
                data: [{ id: 1, name: 'Pinturas', slug: 'pinturas', description: null, imageUrl: null, displayOrder: 0, createdAt: '', updatedAt: '' }],
                meta: { page: 1, limit: 100, total: 1, totalPages: 1 },
              }
            : { data: [], meta: { page: 1, limit: 100, total: 0, totalPages: 0 } },
      );
    }
  });

  it('debounces search input (300ms) before querying', async () => {
    const component = fixture.componentInstance;

    const initial = http.match(
      (r) => r.url.startsWith(`${environment.apiUrl}/public/`),
    );
    for (const r of initial) {
      const isProducts = r.request.url.includes('/public/products');
      const isCategories = r.request.url.includes('/public/categories');
      r.flush(
        isProducts
          ? { data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } }
          : isCategories
            ? {
                data: [{ id: 1, name: 'Pinturas', slug: 'pinturas', description: null, imageUrl: null, displayOrder: 0, createdAt: '', updatedAt: '' }],
                meta: { page: 1, limit: 100, total: 1, totalPages: 1 },
              }
            : { data: [], meta: { page: 1, limit: 100, total: 0, totalPages: 0 } },
      );
    }

    // user types "lata"
    component.onSearchInput('lata');
    expect(component.search()).toBe('lata');

    // wait for debounce to fire (300ms)
    await new Promise((resolve) => setTimeout(resolve, 350));

    const searched = http.expectOne(
      (r) =>
        r.url.startsWith(`${environment.apiUrl}/public/products`) &&
        r.params.get('search') === 'lata',
    );
    searched.flush({
      data: [{ id: 5, catalogId: 1, title: 'Látex', slug: 'latex', description: null, mainImageUrl: null, technicalSheetUrl: null, isActive: true, displayOrder: 0, createdAt: '', updatedAt: '', presentations: [], finishes: [], colors: [], sections: [], images: [] }],
      meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
    });
    await fixture.whenStable();

    expect(component.rows().length).toBe(1);
    expect(component.meta()?.total).toBe(1);
  });
});
