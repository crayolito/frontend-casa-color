import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { describe, expect, it } from 'vitest';
import { PublicCatalog } from '../../../../core/http/catalogs-public.api';
import { DEFAULT_IMAGES } from '../../../../shared/util/default-images';
import { CatalogCard } from './catalog-card';

function catalog(partial: Partial<PublicCatalog> & Pick<PublicCatalog, 'id' | 'name' | 'slug'>): PublicCatalog {
  return {
    categoryId: 1,
    description: null,
    imageUrl: null,
    pdfUrl: null,
    pdfButtonLabel: 'Descargar PDF',
    extraCategoryIds: [],
    extraCategories: [],
    ...partial,
  };
}

@Component({
  standalone: true,
  imports: [CatalogCard],
  template: `<app-catalog-card [catalog]="item" />`,
})
class Host {
  item = catalog({ id: 1, name: 'Demo', slug: 'demo' });
}

describe('CatalogCard', () => {
  async function setup(
    item: PublicCatalog,
  ): Promise<ComponentFixture<Host>> {
    await TestBed.configureTestingModule({
      imports: [Host],
    }).compileComponents();
    const fixture = TestBed.createComponent(Host);
    fixture.componentInstance.item = item;
    fixture.detectChanges();
    return fixture;
  }

  it('uses catalog fallback when imageUrl is empty', async () => {
    const fixture = await setup(
      catalog({ id: 1, name: 'Sin imagen', slug: 'sin', imageUrl: null }),
    );
    const img = (fixture.nativeElement as HTMLElement).querySelector(
      '.catalog-card__img',
    ) as HTMLImageElement | null;
    expect(img?.getAttribute('src')).toBe(DEFAULT_IMAGES.catalog);
    expect(img?.getAttribute('alt')).toBe('Sin imagen');
  });

  it('renders PDF button with custom label', async () => {
    const fixture = await setup(
      catalog({
        id: 1,
        name: 'Con PDF',
        slug: 'pdf',
        imageUrl: '/img.jpg',
        pdfUrl: '/docs/x.pdf',
        pdfButtonLabel: 'VER CATÁLOGO',
      }),
    );
    const btn = (fixture.nativeElement as HTMLElement).querySelector(
      '.catalog-card__button',
    ) as HTMLAnchorElement | null;
    expect(btn?.getAttribute('href')).toBe('/docs/x.pdf');
    expect(btn?.getAttribute('target')).toBe('_blank');
    expect(btn?.getAttribute('rel')).toBe('noopener');
    expect(btn?.textContent?.trim()).toBe('VER CATÁLOGO');
  });

  it('hides PDF button when pdfUrl is missing', async () => {
    const fixture = await setup(
      catalog({
        id: 1,
        name: 'Sin PDF',
        slug: 'no-pdf',
        imageUrl: '/img.jpg',
        pdfUrl: null,
      }),
    );
    expect(
      (fixture.nativeElement as HTMLElement).querySelector('.catalog-card__button'),
    ).toBeNull();
  });
});
