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
        data: [
          {
            id: 1,
            name: 'Pinturas',
            slug: 'pinturas',
            description: null,
            description2: null,
            coverImageUrl: null,
            cardImageUrl: '/card.jpg',
            createdAt: '',
            updatedAt: '',
          },
          {
            id: 2,
            name: 'Exteriores',
            slug: 'exteriores',
            description: null,
            description2: null,
            coverImageUrl: null,
            cardImageUrl: null,
            createdAt: '',
            updatedAt: '',
          },
        ],
        meta: { page: 1, limit: 100, total: 2, totalPages: 1 },
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

  it('abre el modal de categorías de un catálogo, filtra y desasigna principal y extras', () => {
    const fixture = TestBed.createComponent(AdminCatalogs);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.openCategories({
      id: 5,
      categoryId: 1,
      name: 'Látex',
      slug: 'latex',
      description: null,
      imageUrl: null,
      pdfUrl: null,
      pdfButtonLabel: 'Descargar PDF',
      createdAt: '',
      updatedAt: '',
      extraCategoryIds: [2],
      extraCategories: [],
      productsCount: 0,
    });

    expect(component.categoryCount({ ...component.categoriesModal()!.catalog })).toBe(2);
    expect(component.categoriesModal()?.items.length).toBe(2);
    expect(component.categoriesModal()?.items[0].isPrincipal).toBe(true);
    expect(component.categoriesModal()?.items[0].imageUrl).toBe('/card.jpg');

    component.onCategoriesSearch('exter');
    expect(component.filteredModalCategories().length).toBe(1);
    expect(component.filteredModalCategories()[0].name).toBe('Exteriores');
    component.onCategoriesSearch('');

    const updateSpy = vi.spyOn(catalogsApi, 'update');
    // Principal: se quita dejando el catálogo sin categoría principal.
    component.removeCategoryFromCatalog(component.categoriesModal()!.items[0]);
    expect(updateSpy).toHaveBeenCalledWith(5, { categoryId: null });
    expect(component.categoriesModal()?.items.length).toBe(1);

    // Extra: se quita actualizando extraCategoryIds.
    component.removeCategoryFromCatalog(component.categoriesModal()!.items[0]);
    expect(updateSpy).toHaveBeenCalledWith(5, { extraCategoryIds: [] });
    expect(component.categoriesModal()?.items.length).toBe(0);

    component.closeCategoriesModal();
    expect(component.categoriesModal()).toBeNull();
  });
});
