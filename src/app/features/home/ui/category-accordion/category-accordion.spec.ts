import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { CategoryAccordion } from './category-accordion';
import { HomeCategories } from '../../data/home-content.model';

describe('CategoryAccordion', () => {
  let fixture: ComponentFixture<CategoryAccordion>;

  const base: HomeCategories = {
    title: 'Cats',
    items: [
      {
        categoryId: 1,
        name: 'Con catálogos',
        slug: 'con-catalogos',
        displayOrder: 0,
        description: '<p>Hola</p>',
        description2: null,
        imageUrl: null,
        catalogs: [{ id: 10, name: 'Cat', slug: 'cat', products: [] }],
      },
      {
        categoryId: 2,
        name: 'Sin catálogos',
        slug: 'sin-catalogos',
        displayOrder: 1,
        description: null,
        description2: null,
        imageUrl: null,
        catalogs: [],
      },
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryAccordion],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(CategoryAccordion);
    fixture.componentRef.setInput('categories', base);
    fixture.detectChanges();
  });

  it('linkea a /categoria/:slug cuando hay catálogos', () => {
    const links = fixture.nativeElement.querySelectorAll(
      'a.categories__circle-link',
    ) as NodeListOf<HTMLAnchorElement>;
    expect(links.length).toBe(1);
    expect(links[0].getAttribute('href')).toBe('/categoria/con-catalogos');
  });

  it('no renderiza el botón rojo circular si no hay catálogos', () => {
    const columns = fixture.nativeElement.querySelectorAll(
      '.categories__column',
    ) as NodeListOf<HTMLElement>;
    expect(columns.length).toBe(2);
    expect(columns[1].querySelector('a.categories__circle-link')).toBeNull();
  });
});
