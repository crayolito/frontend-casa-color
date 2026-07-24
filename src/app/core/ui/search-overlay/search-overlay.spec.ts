import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { SearchOverlay } from './search-overlay';
import { CatalogsApi } from '../../../features/admin/data/catalogs.api';
import { HomeResolvedCategory } from '../../../features/home/data/home-content.model';

describe('SearchOverlay', () => {
  let fixture: ComponentFixture<SearchOverlay>;

  const categories: HomeResolvedCategory[] = [
    {
      categoryId: 1,
      name: 'Decoración',
      slug: 'decoracion',
      displayOrder: 0,
      description: null,
      imageUrl: null,
      catalogs: [],
    },
    {
      categoryId: 2,
      name: 'Industria',
      slug: 'industria',
      displayOrder: 1,
      description: null,
      imageUrl: null,
      catalogs: [],
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchOverlay],
      providers: [
        provideRouter([]),
        {
          provide: CatalogsApi,
          useValue: {
            list: () =>
              of({
                data: [{ id: 10, name: 'Mate y Decorativa', slug: 'mate' }],
                meta: { page: 1, limit: 100, total: 1, totalPages: 1 },
              }),
          },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SearchOverlay);
    fixture.componentRef.setInput('categories', categories);
    await fixture.whenStable();
  });

  it('filters categories and catalogs by query', async () => {
    const input = fixture.nativeElement.querySelector(
      '#search-overlay-input',
    ) as HTMLInputElement;
    input.value = 'deco';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    const labels = Array.from(
      fixture.nativeElement.querySelectorAll('.search-overlay__label'),
    ).map((el) => (el as HTMLElement).textContent?.trim());

    expect(labels).toContain('Decoración');
    expect(labels).toContain('Mate y Decorativa');
    expect(labels).not.toContain('Industria');
  });

  it('uses short placeholder and no type badges', () => {
    const input = fixture.nativeElement.querySelector(
      '#search-overlay-input',
    ) as HTMLInputElement;
    expect(input.placeholder).toBe('Buscar…');
    expect(
      fixture.nativeElement.querySelector('.search-overlay__kind'),
    ).toBeNull();
  });
});
