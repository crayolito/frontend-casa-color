import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { CategoriesApi } from '../data/categories.api';
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
        createdAt: '',
        updatedAt: '',
      });
    },
    update: () => of({}),
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
    });
    component.save();

    expect(createBody).toEqual({
      name: 'Nueva',
      description: '<p>Uno</p>',
      description2: '<ul><li>Dos</li></ul>',
      coverImageUrl: '/cover.jpg',
      cardImageUrl: '/card.jpg',
    });
    expect(
      (createBody as Record<string, unknown>)['shortDescription'],
    ).toBeUndefined();
    expect(
      (createBody as Record<string, unknown>)['imageUrl'],
    ).toBeUndefined();
  });
});
