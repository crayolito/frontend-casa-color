import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { CatalogsApi } from '../data/catalogs.api';
import { CategoriesApi } from '../data/categories.api';
import { ProductsApi } from '../data/products.api';
import { AdminCatalogs } from './catalogs';

describe('AdminCatalogs', () => {
  const catalogsApi = {
    list: () =>
      of({
        data: [],
        meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
      }),
    create: () => of({}),
    update: (id: number, body: unknown) => of({ id, ...(body as object) }),
    remove: () => of(undefined),
  };

  const categoriesApi = {
    list: () =>
      of({
        data: [],
        meta: { page: 1, limit: 100, total: 0, totalPages: 0 },
      }),
    create: () => of({}),
    update: () => of({}),
    remove: () => of(undefined),
  };

  const productsApi = {
    list: (params?: { catalogId?: number }) =>
      of({
        data: [
          {
            id: 1,
            catalogId: 1,
            catalogs: [{ id: 1, name: 'Látex', categoryId: 1, categoryName: 'Pinturas' }],
            title: 'Látex Interior',
            slug: 'latex-interior',
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
          },
          {
            id: 2,
            catalogId: 1,
            catalogs: [
              { id: 1, name: 'Látex', categoryId: 1, categoryName: 'Pinturas' },
              { id: 2, name: 'Esmalte', categoryId: 1, categoryName: 'Pinturas' },
            ],
            title: 'Esmalte Brillante',
            slug: 'esmalte-brillante',
            description: null,
            mainImageUrl: null,
            technicalSheetUrl: null,
            isActive: true,
            displayOrder: 1,
            createdAt: '',
            updatedAt: '',
            presentations: [],
            finishes: [],
            colors: [],
            colorsCount: 0,
            sections: [],
            images: [],
          },
        ],
        meta: { page: 1, limit: 100, total: 2, totalPages: 1 },
      }),
    update: (id: number, body: unknown) =>
      of({
        id,
        ...(body as object),
        catalogId: 1,
        catalogs: [
          { id: 2, name: 'Esmalte', categoryId: 1, categoryName: 'Pinturas' },
        ],
        title: 'Esmalte Brillante',
        slug: 'esmalte-brillante',
      }),
    remove: () => of(undefined),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminCatalogs],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: CatalogsApi, useValue: catalogsApi },
        { provide: CategoriesApi, useValue: categoriesApi },
        { provide: ProductsApi, useValue: productsApi },
      ],
    }).compileComponents();
  });

  it('abre el modal de productos de un catálogo, filtra por búsqueda y desasigna productos (incluso el único catálogo)', () => {
    const fixture = TestBed.createComponent(AdminCatalogs);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.openProducts({
      id: 1,
      categoryId: 1,
      name: 'Látex',
      slug: 'latex',
      description: null,
      imageUrl: null,
      pdfUrl: null,
      pdfButtonLabel: 'Descargar PDF',
      createdAt: '',
      updatedAt: '',
      extraCategoryIds: [],
      extraCategories: [],
      productsCount: 2,
    });

    expect(component.productsModal()?.items.length).toBe(2);

    component.onProductsSearch('esm');
    expect(component.filteredModalProducts().length).toBe(1);
    expect(component.filteredModalProducts()[0].title).toBe('Esmalte Brillante');
    component.onProductsSearch('');

    const updateSpy = vi.spyOn(productsApi, 'update');
    // Producto con un solo catálogo: se desasigna y queda suelto.
    component.removeProductFromCatalog(component.productsModal()!.items[0]);
    expect(updateSpy).toHaveBeenCalledWith(1, { catalogIds: [] });
    expect(component.productsModal()?.items.length).toBe(1);

    // Dos catálogos: se desasigna enviando catalogIds sin este catálogo.
    component.removeProductFromCatalog(component.productsModal()!.items[0]);
    expect(updateSpy).toHaveBeenCalledWith(2, { catalogIds: [2] });
    expect(component.productsModal()?.items.length).toBe(0);

    component.closeProductsModal();
    expect(component.productsModal()).toBeNull();
  });
});
