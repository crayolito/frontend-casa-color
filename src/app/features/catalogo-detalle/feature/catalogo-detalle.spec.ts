import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { signal } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import {
  CatalogsPublicApi,
  PublicCatalog,
} from '../../../core/http/catalogs-public.api';
import { ProductsPublicApi } from '../../../core/http/products-public.api';
import { HomeApi } from '../../home/data/home.api';
import { HomeContent } from '../../home/data/home-content.model';
import { CatalogoDetalle } from './catalogo-detalle';

const CATALOG: PublicCatalog = {
  id: 1,
  categoryId: 5,
  name: 'Catálogo A',
  slug: 'catalogo-a',
  description: null,
  imageUrl: '/uploads/cat-a.jpg',
  pdfUrl: null,
  pdfButtonLabel: '',
  extraCategoryIds: [],
  extraCategories: [],
  category: { id: 5, name: 'Pinturas', slug: 'pinturas' },
};

const ROUTE = {
  get: (key: string) => (key === 'slug' ? 'catalogo-a' : null),
};

describe('CatalogoDetalle', () => {
  async function setup(opts?: {
    whatsapp?: boolean;
    error?: boolean;
    loading?: boolean;
  }): Promise<{ fixture: ComponentFixture<CatalogoDetalle>; getBySlug: ReturnType<typeof vi.fn> }> {
    const getBySlug = vi.fn(() => {
      if (opts?.loading) {
        return new Observable<never>(() => {});
      }
      if (opts?.error) {
        return throwError(() => ({
          status: 500,
          code: 'INTERNAL_ERROR',
          message: 'Error interno',
          correlationId: 'corr-1',
        }));
      }
      return of(CATALOG);
    });

    await TestBed.configureTestingModule({
      imports: [CatalogoDetalle],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        {
          provide: CatalogsPublicApi,
          useValue: {
            getBySlug,
            list: () => of({ data: [] }),
          },
        },
        {
          provide: ProductsPublicApi,
          useValue: {
            list: () => of({ data: [] }),
          },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: { paramMap: ROUTE },
            paramMap: of(ROUTE),
          },
        },
        {
          provide: HomeApi,
          useValue: {
            content: signal<HomeContent | null>(
              opts?.whatsapp
                ? ({
                    floating: {
                      whatsapp: {
                        enabled: true,
                        phone: '59122421800',
                        message: 'Hola',
                      },
                    },
                  } as unknown as HomeContent)
                : null,
            ),
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(CatalogoDetalle);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return { fixture, getBySlug };
  }

  it('renderiza el hero y el heading del catálogo', async () => {
    const { fixture } = await setup();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.catalogo-detalle__hero')).toBeTruthy();
    expect(
      el.querySelector('h5.catalogo-detalle__heading')?.textContent,
    ).toContain('Catálogo A');
  });

  it('convierte el hero en link a WhatsApp cuando está habilitado', async () => {
    const { fixture } = await setup({ whatsapp: true });
    const el = fixture.nativeElement as HTMLElement;
    const hero = el.querySelector(
      'a.catalogo-detalle__hero',
    ) as HTMLAnchorElement;
    expect(hero).toBeTruthy();
    expect(hero.href).toBe(
      'https://wa.me/59122421800?text=' +
        encodeURIComponent('Hola, me interesa Catálogo A'),
    );
    expect(hero.target).toBe('_blank');
    expect(hero.rel).toContain('noopener');
    expect(hero.rel).toContain('noreferrer');
    expect(hero.getAttribute('aria-label')).toBe(
      'Contactar por WhatsApp sobre Catálogo A',
    );
  });

  it('mantiene el hero como div no clickeable sin WhatsApp habilitado', async () => {
    const { fixture } = await setup();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.catalogo-detalle__hero')?.tagName).toBe('DIV');
    expect(el.querySelector('a.catalogo-detalle__hero')).toBeNull();
  });

  it('muestra el estado de carga mientras carga', async () => {
    const { fixture } = await setup({ loading: true });
    expect(fixture.nativeElement.textContent).toContain('Cargando catálogo…');
  });

  it('muestra error y permite reintentar', async () => {
    const { fixture, getBySlug } = await setup({ error: true });
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.catalogo-detalle__status--error')).toBeTruthy();

    getBySlug.mockReturnValueOnce(of(CATALOG));
    el.querySelector('.catalogo-detalle__retry')?.dispatchEvent(new Event('click'));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(getBySlug).toHaveBeenCalledTimes(2);
    expect(el.querySelector('.catalogo-detalle__hero')).toBeTruthy();
  });
});
