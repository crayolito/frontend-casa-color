import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SearchProductCardItem } from '../../util/search-product-card-item';
import { SearchProductCard } from './search-product-card';

describe('SearchProductCard', () => {
  let fixture: ComponentFixture<SearchProductCard>;

  async function setup(item: SearchProductCardItem) {
    await TestBed.configureTestingModule({
      imports: [SearchProductCard],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(SearchProductCard);
    fixture.componentRef.setInput('result', item);
    fixture.detectChanges();
  }

  it('renders Producto badge and link for product type', async () => {
    await setup({
      title: 'Acrílico',
      href: '/producto/acrilico',
      image: '/img/a.jpg',
      type: 'producto',
    });
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Acrílico');
    expect(el.textContent).toContain('Producto');
    expect(el.querySelector('a')?.getAttribute('href')).toBe('/producto/acrilico');
  });

  it('renders Categoría badge', async () => {
    await setup({
      title: 'Línea Deco',
      href: '/categoria/linea-deco',
      type: 'categoria',
    });
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Categoría');
  });

  it('renders Catálogo badge', async () => {
    await setup({
      title: 'Mate',
      href: '/catalogo/mate',
      type: 'catalogo',
    });
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Catálogo');
  });
});
