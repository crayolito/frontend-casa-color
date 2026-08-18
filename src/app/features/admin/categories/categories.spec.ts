import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { CategoriesApi } from '../data/categories.api';
import { CatalogsApi } from '../data/catalogs.api';
import { AdminCategories } from './categories';

describe('AdminCategories', () => {
  let createBody: unknown;
  const api = {
    list: () =>
      of({
        data: [],
        meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
      }),
    create: (body: unknown) => {
      createBody = body;
      return of({
        id: 1,
        name: 'Nueva',
        slug: 'nueva',
        description: '<p>Uno</p>',
        description2: '<p>Dos</p>',
        coverImageUrl: null,
        cardImageUrl: null,
        showCoverImage: true,
        createdAt: '',
        updatedAt: '',
      });
    },
    update: () => of({}),
    remove: () => of(undefined),
  };

  const catalogsApi = {
    list: (page: number, limit: number, categoryId?: number) =>
      of({
        data: [
          {
            id: 1,
            categoryId: 1,
            name: 'Látex',
            slug: 'latex',
            description: null,
            imageUrl: null,
            showCoverImage: true,
            pdfUrl: null,
            pdfButtonLabel: 'Descargar PDF',
            createdAt: '',
            updatedAt: '',
            extraCategoryIds: [],
            extraCategories: [],
          },
          {
            id: 2,
            categoryId: 2,
            name: 'Esmalte',
            slug: 'esmalte',
            description: null,
            imageUrl: null,
            showCoverImage: true,
            pdfUrl: null,
            pdfButtonLabel: 'Descargar PDF',
            createdAt: '',
            updatedAt: '',
            extraCategoryIds: [1],
            extraCategories: [{ id: 1, name: 'Pinturas', slug: 'pinturas' }],
          },
        ],
        meta: { page: 1, limit: 100, total: 2, totalPages: 1 },
      }),
    update: (id: number, body: unknown) => of({ id, ...(body as object) }),
    create: () => of({}),
    remove: () => of(undefined),
  };

  beforeEach(async () => {
    createBody = undefined;
    await TestBed.configureTestingModule({
      imports: [AdminCategories],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: CategoriesApi, useValue: api },
        { provide: CatalogsApi, useValue: catalogsApi },
      ],
    }).compileComponents();
  });

  it('al guardar crea con description, description2 y ambas imágenes', () => {
    const fixture = TestBed.createComponent(AdminCategories);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.openCreate();
    component.form.setValue({
      name: 'Nueva',
      description: '<p>Uno</p>',
      description2: '<ul><li>Dos</li></ul>',
      coverImageUrl: '/cover.jpg',
      cardImageUrl: '/card.jpg',
      showCoverImage: true,
    });
    component.save();

    expect(createBody).toEqual({
      name: 'Nueva',
      description: '<p>Uno</p>',
      description2: '<ul><li>Dos</li></ul>',
      coverImageUrl: '/cover.jpg',
      cardImageUrl: '/card.jpg',
      showCoverImage: true,
    });
    expect(
      (createBody as Record<string, unknown>)['shortDescription'],
    ).toBeUndefined();
    expect(
      (createBody as Record<string, unknown>)['imageUrl'],
    ).toBeUndefined();
  });

  it('alterna entre vista tarjeta y listado, persistiendo en localStorage', () => {
    localStorage.removeItem('admin.categories.view.v2');
    const fixture = TestBed.createComponent(AdminCategories);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.viewMode()).toBe('card');

    component.setViewMode('list');
    expect(component.viewMode()).toBe('list');
    expect(localStorage.getItem('admin.categories.view.v2')).toBe('list');

    component.setViewMode('card');
    expect(component.viewMode()).toBe('card');
    expect(localStorage.getItem('admin.categories.view.v2')).toBe('card');
  });

  it('abre el modal de catálogos de una categoría, filtra por búsqueda y desasigna principal y extras', () => {
    const fixture = TestBed.createComponent(AdminCategories);
    const component = fixture.componentInstance;
    fixture.detectChanges();

    component.openCatalogs({
      id: 1,
      name: 'Pinturas',
      slug: 'pinturas',
      description: null,
      description2: null,
      coverImageUrl: null,
      cardImageUrl: null,
      showCoverImage: true,
      createdAt: '',
      updatedAt: '',
      catalogsCount: 2,
    });

    expect(component.catalogsModal()?.items.length).toBe(2);
    expect(component.catalogIsPrincipal(component.catalogsModal()!.items[0])).toBe(true);
    expect(component.catalogIsPrincipal(component.catalogsModal()!.items[1])).toBe(false);

    component.onCatalogsSearch('esm');
    expect(component.filteredModalCatalogs().length).toBe(1);
    expect(component.filteredModalCatalogs()[0].name).toBe('Esmalte');
    component.onCatalogsSearch('');

    const updateSpy = vi.spyOn(catalogsApi, 'update');
    // El principal se desasigna dejando el catálogo sin categoría.
    component.removeCatalogFromCategory(component.catalogsModal()!.items[0]);
    expect(updateSpy).toHaveBeenCalledWith(1, { categoryId: null });
    expect(component.catalogsModal()?.items.length).toBe(1);

    // El extra se desasigna actualizando extraCategoryIds.
    component.removeCatalogFromCategory(component.catalogsModal()!.items[0]);
    expect(updateSpy).toHaveBeenCalledWith(2, { extraCategoryIds: [] });
    expect(component.catalogsModal()?.items.length).toBe(0);

    component.closeCatalogsModal();
    expect(component.catalogsModal()).toBeNull();
  });
});
