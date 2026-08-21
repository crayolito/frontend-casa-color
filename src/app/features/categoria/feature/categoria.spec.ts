import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { signal } from '@angular/core';
import { of, throwError } from 'rxjs';
import { CategoriaApi } from '../data/categoria.api';
import { CategoryDetail } from '../data/categoria.model';
import { HomeApi } from '../../home/data/home.api';
import { HomeContent } from '../../home/data/home-content.model';
import { Categoria } from './categoria';

const WHATSAPP_OBJECT = { enabled: true, phone: '59122421800' };

const SAMPLE: CategoryDetail = {
  id: 1,
  name: 'Línea Deco',
  slug: 'linea-deco',
  description: '<p>Desc 1</p>',
  description2: '<ul><li>Item</li></ul>',
  coverImageUrl: '/hero.jpg',
  cardImageUrl: '/card.jpg',
  createdAt: '',
  updatedAt: '',
  catalogs: [
    {
      id: 10,
      name: 'Catálogo A',
      slug: 'catalogo-a',
      imageUrl: '/cat.jpg',
      products: [{ id: 1, title: 'Prod', slug: 'prod' }],
    },
    {
      id: 11,
      name: 'Catálogo B',
      slug: 'catalogo-b',
      imageUrl: '/cat-b.jpg',
      products: [],
    },
  ],
};

describe('Categoria', () => {
  async function setup(opts?: {
    detail?: CategoryDetail | null;
    error?: boolean;
    slug?: string | null;
    whatsapp?: { enabled: boolean; phone?: string; message?: string } | null;
  }) {
    const detail = opts?.detail === undefined ? SAMPLE : opts.detail;
    let loadedSlug: string | undefined;
    const api = {
      loadCategoria: (slug: string) => {
        loadedSlug = slug;
        return opts?.error
          ? throwError(() => ({ status: 404 }))
          : of(detail as CategoryDetail);
      },
    };

    await TestBed.configureTestingModule({
      imports: [Categoria],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: CategoriaApi, useValue: api },
        {
          provide: HomeApi,
          useValue: {
            content: signal<HomeContent | null>(
              opts?.whatsapp
                ? ({ floating: { whatsapp: opts.whatsapp } } as unknown as HomeContent)
                : null,
            ),
          },
        },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: (key: string) =>
                  key === 'slug'
                    ? opts?.slug === undefined
                      ? 'linea-deco'
                      : opts.slug
                    : null,
              },
            },
          },
        },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(Categoria);
    fixture.detectChanges();
    return { fixture, loadedSlug: () => loadedSlug };
  }

  it('carga categoría y renderiza cards de catálogos', async () => {
    const { fixture, loadedSlug } = await setup();
    expect(loadedSlug()).toBe('linea-deco');
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Línea Deco');
    expect(el.textContent).toContain('Catálogo A');
    const link = el.querySelector('a.categoria__card') as HTMLAnchorElement;
    expect(link.getAttribute('href')).toContain('/catalogo');
    expect(link.getAttribute('href')).toContain('catalogo-a');
  });

  it('renderiza hero con capa de fondo, heading e intro en dos columnas', async () => {
    const { fixture } = await setup();
    const el: HTMLElement = fixture.nativeElement;

    expect(el.querySelector('.categoria__hero')).toBeTruthy();
    expect(el.querySelector('.categoria__hero-bg')).toBeTruthy();
    expect(el.querySelector('h5.categoria__heading')?.textContent).toContain(
      'Línea Deco',
    );

    const intro = el.querySelector('.categoria__intro');
    expect(intro).toBeTruthy();
    expect(intro?.children.length).toBe(2);
  });

  it('usa coverImageUrl en el hero y cae a cardImageUrl si falta', async () => {
    const { fixture } = await setup();
    const el: HTMLElement = fixture.nativeElement;
    const bg = el.querySelector('.categoria__hero-bg') as HTMLElement;
    expect(bg.style.backgroundImage).toContain('/hero.jpg');

    fixture.destroy();
    TestBed.resetTestingModule();
    const { fixture: fixture2 } = await setup({
      detail: { ...SAMPLE, coverImageUrl: null },
    });
    const bg2 = (fixture2.nativeElement as HTMLElement).querySelector(
      '.categoria__hero-bg',
    ) as HTMLElement;
    expect(bg2.style.backgroundImage).toContain('/card.jpg');
  });

  it('oculta el hero si showCoverImage es false', async () => {
    const { fixture } = await setup({
      detail: { ...SAMPLE, showCoverImage: false },
    });
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.categoria__hero')).toBeNull();
    expect(el.querySelector('h5.categoria__heading')?.textContent).toContain(
      'Línea Deco',
    );
  });

  it('aplica appReveal a las cards de catálogo', async () => {
    const { fixture } = await setup();
    const el: HTMLElement = fixture.nativeElement;
    const cards = el.querySelectorAll('a.categoria__card');
    expect(cards.length).toBe(2);
    cards.forEach((card) => {
      expect(card.classList.contains('reveal')).toBe(true);
    });
  });

  it('muestra vacío cuando no hay catálogos', async () => {
    const { fixture } = await setup({
      detail: { ...SAMPLE, catalogs: [] },
    });
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('todavía no tiene catálogos');
  });

  it('muestra error cuando falla la carga', async () => {
    const { fixture } = await setup({ error: true });
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.categoria__error')).toBeTruthy();
  });

  it('convierte el hero en link a WhatsApp cuando está habilitado', async () => {
    const { fixture } = await setup({ whatsapp: WHATSAPP_OBJECT });
    const el: HTMLElement = fixture.nativeElement;
    const hero = el.querySelector('a.categoria__hero') as HTMLAnchorElement;
    expect(hero).toBeTruthy();
    expect(hero.href).toBe(
      'https://wa.me/59122421800?text=' +
        encodeURIComponent('Hola, me interesa Línea Deco'),
    );
    expect(hero.target).toBe('_blank');
    expect(hero.rel).toContain('noopener');
    expect(hero.rel).toContain('noreferrer');
    expect(hero.getAttribute('aria-label')).toBe(
      'Contactar por WhatsApp sobre Línea Deco',
    );
    expect(el.querySelector('.categoria__hero-bg')).toBeTruthy();
  });

  it('mantiene el hero como div no clickeable si WhatsApp está deshabilitado', async () => {
    const { fixture } = await setup({
      whatsapp: { ...WHATSAPP_OBJECT, enabled: false },
    });
    const el: HTMLElement = fixture.nativeElement;
    const hero = el.querySelector('.categoria__hero');
    expect(hero?.tagName).toBe('DIV');
    expect(hero?.hasAttribute('href')).toBe(false);
    expect(el.querySelector('a.categoria__hero')).toBeNull();
  });

  it('mantiene el hero como div si el teléfono no tiene dígitos', async () => {
    const { fixture } = await setup({
      whatsapp: { enabled: true, phone: '  ' },
    });
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.categoria__hero')?.tagName).toBe('DIV');
    expect(el.querySelector('a.categoria__hero')).toBeNull();
  });

  it('codifica el nombre de la categoría en el texto del mensaje', async () => {
    const { fixture } = await setup({
      detail: { ...SAMPLE, name: 'Pinturas & Acabados' },
      whatsapp: WHATSAPP_OBJECT,
    });
    const hero = fixture.nativeElement.querySelector(
      'a.categoria__hero',
    ) as HTMLAnchorElement;
    expect(hero.href).toBe(
      'https://wa.me/59122421800?text=' +
        encodeURIComponent('Hola, me interesa Pinturas & Acabados'),
    );
  });
});
