import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { of, throwError } from 'rxjs';
import { CategoriaApi } from '../data/categoria.api';
import { CategoryDetail } from '../data/categoria.model';
import { Categoria } from './categoria';

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
});
