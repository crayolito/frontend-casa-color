import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HomeCategories } from '../../data/home-content.model';
import { CategoryAccordion } from './category-accordion';

describe('CategoryAccordion', () => {
  let fixture: ComponentFixture<CategoryAccordion>;

  const categories: HomeCategories = {
    title: 'Nuestras categorías',
    items: [
      {
        categoryId: 1,
        name: 'Decoración',
        slug: 'decoracion',
        displayOrder: 0,
        description: 'Línea Deco',
        imageUrl: '/deco.jpg',
        catalogs: [
          {
            id: 10,
            name: 'Línea Deco',
            slug: 'linea-deco',
            products: [{ id: 100, title: 'Pintura', slug: 'pintura' }],
          },
        ],
      },
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CategoryAccordion],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(CategoryAccordion);
    fixture.componentRef.setInput('categories', categories);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('does not paint section title on public', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.categories__section-title')).toBeNull();
    expect(el.textContent).not.toContain('Nuestras categorías');
  });

  it('shows collections always visible (clone behavior)', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.categories__groups')).not.toBeNull();
    expect(el.querySelector('.accordion')).not.toBeNull();
    expect(el.querySelector('.categories__circle-toggle')).toBeNull();
  });

  it('circle is a link like the clone', () => {
    const el = fixture.nativeElement as HTMLElement;
    const circle = el.querySelector(
      'a.categories__circle-link',
    ) as HTMLAnchorElement | null;
    expect(circle).not.toBeNull();
    expect(circle?.getAttribute('href')).toBeTruthy();
  });
});
