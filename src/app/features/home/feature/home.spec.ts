import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CATEGORY_LINES } from '../../../shared/util/data/home-data';
import { Home } from './home';

describe('Home', () => {
  let fixture: ComponentFixture<Home>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
    }).compileComponents();

    fixture = TestBed.createComponent(Home);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the three category columns', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const titles = Array.from(
      compiled.querySelectorAll('.categories__title'),
    ).map((el) => el.textContent?.trim());

    expect(titles).toEqual(['Decoración', 'Industria', 'Arte']);
  });

  it('should render the find-product heading without a search form', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const section = compiled.querySelector('.find-product');
    expect(compiled.querySelector('#find-product-title')?.textContent).toContain(
      'Encuentra un producto',
    );
    expect(section?.querySelector('form')).toBeNull();
    expect(section?.querySelector('input')).toBeNull();
  });

  it('should render the nine hero slides', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const slides = compiled.querySelectorAll('.hero__slide');
    expect(slides.length).toBe(9);
  });

  it('should never render a CTA on Línea Art slides', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const slides = Array.from(compiled.querySelectorAll('.hero__slide'));
    const artSlides = slides.filter((slide) =>
      slide.querySelector('.hero__title')?.textContent?.includes('Línea Art'),
    );

    expect(artSlides.length).toBe(3);
    for (const slide of artSlides) {
      expect(slide.querySelector('.hero__cta')).toBeNull();
    }
  });

  it('should keep Deco and Tecno catalogs without placeholder products', () => {
    const realLines = CATEGORY_LINES.filter((line) => line.title !== 'Arte');
    for (const line of realLines) {
      for (const group of line.groups) {
        expect(group.products).not.toContain('En desarrollo');
        expect(group.products.length).toBeGreaterThan(0);
      }
    }
  });

  it('should keep Arte groups matching the original site placeholders', () => {
    const art = CATEGORY_LINES.find((line) => line.title === 'Arte');
    expect(art).toBeTruthy();
    expect(art!.groups.map((g) => g.title)).toEqual([
      'PINTURAS',
      'AUXILIARES AL AGUA',
      'AUXILIARES SINTÉTICOS',
      'PINCELES',
      'EXPOSITORES',
    ]);
    for (const group of art!.groups) {
      expect(group.products).toEqual(['En desarrollo']);
    }
  });

  it('should render decor-divider trazo image', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const img = compiled.querySelector(
      '.decor-divider__img',
    ) as HTMLImageElement | null;
    expect(img).toBeTruthy();
    expect(img?.getAttribute('src')).toBe('/img/decor/trazo-amarillo.png');
  });

  it('should render graphic-section with red-paint background', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const graphic = compiled.querySelector('.graphic') as HTMLElement | null;
    expect(graphic).toBeTruthy();
    expect(graphic?.getAttribute('style')).toContain(
      '/img/decor/red-paint.png',
    );
  });

  it('should render a solid white header (never transparent)', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const header = compiled.querySelector('.header') as HTMLElement | null;
    expect(header).toBeTruthy();
    expect(header?.classList.contains('header')).toBe(true);
  });

  it('should render Decoración submenu with exactly one simple link', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const decoItem = Array.from(compiled.querySelectorAll('.header__item')).find((item) =>
      item.querySelector('.header__link')?.textContent?.includes('DECORACIÓN'),
    );
    expect(decoItem).toBeTruthy();
    const links = Array.from(decoItem!.querySelectorAll('.header__submenu-link')).map((el) =>
      el.textContent?.trim(),
    );
    expect(links).toEqual(['LÍNEA DECO']);
  });

  it('should render Documentación submenu with three documentation links', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const docsItem = Array.from(compiled.querySelectorAll('.header__item')).find((item) =>
      item.querySelector('.header__link')?.textContent?.includes('DOCUMENTACIÓN'),
    );
    expect(docsItem).toBeTruthy();
    const links = Array.from(docsItem!.querySelectorAll('.header__submenu-link')).map((el) =>
      el.textContent?.trim(),
    );
    expect(links).toEqual(['CATÁLOGOS', 'CARTAS DE COLOR', 'FICHAS TÉCNICAS']);
  });

  it('should not render catalog products inside header submenus', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.header__mega')).toBeNull();
    expect(compiled.querySelector('.header__mega-products')).toBeNull();
    const submenuText = Array.from(compiled.querySelectorAll('.header__submenu-link'))
      .map((el) => el.textContent?.trim() ?? '')
      .join(' ');
    expect(submenuText).not.toContain('Acrílico');
    expect(submenuText).not.toContain('Imprimación Alcídica');
  });

  it('should not render invented social icons in the footer', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.footer__social')).toBeNull();
  });

  it('should render the Cuaderna Vía copyright link', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const link = compiled.querySelector(
      '.footer__copyright a',
    ) as HTMLAnchorElement | null;
    expect(link).toBeTruthy();
    expect(link?.textContent?.trim()).toBe('Cuaderna Vía');
    expect(link?.getAttribute('href')).toBe('https://cuadernavia.com/');
  });
});
