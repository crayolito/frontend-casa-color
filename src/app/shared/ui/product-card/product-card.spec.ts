import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProductItem } from './product-item';
import { ProductCard } from './product-card';

const SAMPLE: ProductItem = {
  title: 'Emulsión hidrófuga',
  href: '/producto/emulsion-hidrofuga',
  image: '/img/emulsion.jpg',
  imageWidth: 375,
  imageHeight: 400,
  categories: [
    { label: 'Línea Deco', href: '/categoria/linea-deco' },
    { label: 'Tratamiento de fachadas', href: '/categoria/tratamiento' },
  ],
};

describe('ProductCard', () => {
  let fixture: ComponentFixture<ProductCard>;

  async function setup(opts?: {
    product?: ProductItem;
    columns?: 3 | 4 | 'archive-4';
  }) {
    await TestBed.configureTestingModule({
      imports: [ProductCard],
    }).compileComponents();
    fixture = TestBed.createComponent(ProductCard);
    fixture.componentRef.setInput('product', opts?.product ?? SAMPLE);
    if (opts?.columns !== undefined) {
      fixture.componentRef.setInput('columns', opts.columns);
    }
    fixture.detectChanges();
  }

  it('renders wrap + img with WooCommerce thumbnail dimensions', async () => {
    await setup();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.product-card__wrap')).toBeTruthy();
    const img = el.querySelector(
      '.product-card__img:not(.product-card__img--hover)',
    ) as HTMLImageElement;
    expect(img).toBeTruthy();
    expect(img.getAttribute('width')).toBe('375');
    expect(img.getAttribute('height')).toBe('400');
    expect(img.getAttribute('alt')).toBe(SAMPLE.title);
  });

  it('keeps overlay and categories hidden at rest', async () => {
    await setup();
    const el = fixture.nativeElement as HTMLElement;
    const overlay = el.querySelector('.product-card__overlay') as HTMLElement;
    const hover = el.querySelector('.product-card__hover') as HTMLElement;
    expect(overlay).toBeTruthy();
    expect(hover).toBeTruthy();
    expect(getComputedStyle(overlay).opacity).toBe('0');
    expect(getComputedStyle(hover).opacity).toBe('0');
    expect(el.textContent).toContain('Línea Deco');
  });

  it('defines hover/focus-within overlay rules matching the clone', async () => {
    await setup();
    const el = fixture.nativeElement as HTMLElement;
    const link = el.querySelector(
      '.product-card__link-overlay',
    ) as HTMLAnchorElement;
    expect(link.getAttribute('href')).toBe(SAMPLE.href);

    // jsdom/happy-dom no aplica :hover/:focus-within a getComputedStyle;
    // verificamos que las reglas del clon viven en el stylesheet del componente
    // (Angular reescribe :host a selectores de encapsulación).
    const sheets = Array.from(document.styleSheets);
    const rulesText = sheets
      .flatMap((sheet) => {
        try {
          return Array.from(sheet.cssRules).map((r) => r.cssText);
        } catch {
          return [] as string[];
        }
      })
      .join('\n');

    expect(rulesText).toContain('product-card__overlay');
    expect(rulesText).toContain('product-card__hover');
    expect(rulesText).toMatch(/opacity:\s*0\.88/);
    expect(rulesText).toMatch(/:hover|:focus-within/);
  });

  it('exposes data-columns="archive-4" on the host', async () => {
    await setup({ columns: 'archive-4' });
    const host = fixture.nativeElement as HTMLElement;
    expect(host.getAttribute('data-columns')).toBe('archive-4');
  });

  it('uses loop title size (18px) not h4, and accent Leer más like clone', async () => {
    await setup();
    const el = fixture.nativeElement as HTMLElement;
    const title = el.querySelector('.product-card__title') as HTMLElement;
    const button = el.querySelector('.product-card__button') as HTMLElement;
    const titleStyle = getComputedStyle(title);
    const buttonStyle = getComputedStyle(button);
    expect(titleStyle.fontSize).toBe('18px');
    expect(titleStyle.lineHeight).toBe('23px');
    expect(titleStyle.fontWeight).toMatch(/^(400|normal)$/);
    // Cascada real del clon: salient-dynamic-styles #dd3333!important
    expect(buttonStyle.color).toMatch(/rgb\(221,\s*51,\s*51\)/);
    expect(buttonStyle.fontSize).toBe('16px');
  });
});
