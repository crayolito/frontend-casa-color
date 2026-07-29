import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { SearchOverlay } from './search-overlay';
import { CatalogsApi } from '../../../features/admin/data/catalogs.api';
import { HomeResolvedCategory } from '../../../features/home/data/home-content.model';

describe('SearchOverlay', () => {
  let fixture: ComponentFixture<SearchOverlay>;
  let router: Router;

  const categories: HomeResolvedCategory[] = [
    {
      categoryId: 1,
      name: 'Decoración',
      slug: 'decoracion',
      displayOrder: 0,
      description: null,
      description2: null,
      imageUrl: null,
      catalogs: [],
    },
    {
      categoryId: 2,
      name: 'Industria',
      slug: 'industria',
      displayOrder: 1,
      description: null,
      description2: null,
      imageUrl: null,
      catalogs: [],
    },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchOverlay],
      providers: [
        provideRouter([{ path: 'search', children: [] }]),
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

    router = TestBed.inject(Router);
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

  it('shows type badges on suggestions', async () => {
    const input = fixture.nativeElement.querySelector(
      '#search-overlay-input',
    ) as HTMLInputElement;
    input.value = 'deco';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    const kinds = Array.from(
      fixture.nativeElement.querySelectorAll('.search-overlay__kind'),
    ).map((el) => (el as HTMLElement).textContent?.trim());

    expect(kinds).toContain('Categoría');
    expect(kinds).toContain('Catálogo');
  });

  it('links category and catalog suggestions to their slugs', async () => {
    const input = fixture.nativeElement.querySelector(
      '#search-overlay-input',
    ) as HTMLInputElement;
    input.value = 'deco';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    const links = Array.from(
      fixture.nativeElement.querySelectorAll(
        'a.search-overlay__result',
      ) as NodeListOf<HTMLAnchorElement>,
    );
    const hrefs = links.map((a) => a.getAttribute('href'));

    expect(hrefs).toContain('/categoria/decoracion');
    expect(hrefs).toContain('/catalogo/mate');
  });

  it('navigates to /search?q= on Enter submit', async () => {
    const navigateSpy = vi
      .spyOn(router, 'navigate')
      .mockResolvedValue(true);
    let closed = false;
    fixture.componentInstance.closed.subscribe(() => {
      closed = true;
    });

    const input = fixture.nativeElement.querySelector(
      '#search-overlay-input',
    ) as HTMLInputElement;
    input.value = 'esmalte';
    input.dispatchEvent(new Event('input'));
    await fixture.whenStable();

    const form = fixture.nativeElement.querySelector(
      '.search-overlay__form',
    ) as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    expect(navigateSpy).toHaveBeenCalledWith(['/search'], {
      queryParams: { q: 'esmalte' },
    });
    expect(closed).toBe(true);
  });

  it('does not navigate on empty submit', async () => {
    const navigateSpy = vi
      .spyOn(router, 'navigate')
      .mockResolvedValue(true);
    const form = fixture.nativeElement.querySelector(
      '.search-overlay__form',
    ) as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    expect(navigateSpy).not.toHaveBeenCalled();
  });
});
