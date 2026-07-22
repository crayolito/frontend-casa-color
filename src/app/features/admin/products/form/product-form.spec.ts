import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { AdminProductForm } from './product-form';
import { environment } from '../../../../../environments/environment';

describe('AdminProductForm (create)', () => {
  let fixture: ComponentFixture<AdminProductForm>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminProductForm],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'admin/products', children: [] }]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminProductForm);
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();

    const catalogsReq = http.expectOne(
      (r) => r.url.startsWith(`${environment.apiUrl}/public/catalogs`),
    );
    catalogsReq.flush({
      data: [{ id: 1, categoryId: 1, name: 'Cat', slug: 'cat', description: null, imageUrl: null, displayOrder: 0, createdAt: '', updatedAt: '' }],
      meta: { page: 1, limit: 100, total: 1, totalPages: 1 },
    });
    await fixture.whenStable();
  });

  afterEach(() => {
    http.verify();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should create a product with nested presentations (happy path)', async () => {
    const component = fixture.componentInstance;
    component.form.patchValue({
      catalogId: 1,
      title: 'Látex Premium',
      description: 'Test',
      isActive: true,
      displayOrder: 0,
    });
    component.addPresentation();
    component.presentations.at(0).patchValue({ value: '1L', displayOrder: 0 });

    component.save();

    const req = http.expectOne(`${environment.apiUrl}/admin/products`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body.title).toBe('Látex Premium');
    expect(req.request.body.presentations).toEqual([
      { value: '1L', displayOrder: 0 },
    ]);
    req.flush({
      data: {
        id: 10,
        catalogId: 1,
        title: 'Látex Premium',
        slug: 'latex-premium',
        description: 'Test',
        mainImageUrl: null,
        technicalSheetUrl: null,
        isActive: true,
        displayOrder: 0,
        createdAt: '',
        updatedAt: '',
        presentations: [],
        finishes: [],
        colors: [],
        sections: [],
      },
    });
    await fixture.whenStable();
    expect(component.saving()).toBe(false);
  });
});

describe('AdminProductForm (edit by id)', () => {
  let fixture: ComponentFixture<AdminProductForm>;
  let http: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminProductForm],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'admin/products', children: [] }]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminProductForm);
    fixture.componentRef.setInput('id', '7');
    http = TestBed.inject(HttpTestingController);
    fixture.detectChanges();

    // catalogs on init
    const catalogsReq = http.expectOne(
      (r) => r.url.startsWith(`${environment.apiUrl}/public/catalogs`),
    );
    catalogsReq.flush({
      data: [{ id: 1, categoryId: 1, name: 'Cat', slug: 'cat', description: null, imageUrl: null, displayOrder: 0, createdAt: '', updatedAt: '' }],
      meta: { page: 1, limit: 100, total: 1, totalPages: 1 },
    });

    // GET by id (new admin endpoint, includes inactives)
    const productReq = http.expectOne(
      (r) => r.url === `${environment.apiUrl}/admin/products/7`,
    );
    expect(productReq.request.method).toBe('GET');
    productReq.flush({
      data: {
        id: 7,
        catalogId: 1,
        title: 'Descontinuado',
        slug: 'descontinuado',
        description: null,
        mainImageUrl: null,
        technicalSheetUrl: null,
        isActive: false,
        displayOrder: 0,
        createdAt: '',
        updatedAt: '',
        presentations: [],
        finishes: [],
        colors: [],
        sections: [],
        images: [
          { id: 1, url: 'https://x/a.jpg', publicId: 'a', isMain: true, displayOrder: 0 },
        ],
      },
    });
    await fixture.whenStable();
  });

  afterEach(() => {
    http.verify();
  });

  it('loads product by id via admin endpoint (including inactives)', () => {
    const component = fixture.componentInstance;
    expect(component.loadedProduct()?.id).toBe(7);
    expect(component.loadedProduct()?.isActive).toBe(false);
    expect(component.form.controls.title.value).toBe('Descontinuado');
    expect(component.images().length).toBe(1);
    expect(component.images()[0].isMain).toBe(true);
  });
});

