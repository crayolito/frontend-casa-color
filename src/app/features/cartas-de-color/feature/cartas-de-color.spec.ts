import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CartasDeColor } from './cartas-de-color';

describe('CartasDeColor', () => {
  let fixture: ComponentFixture<CartasDeColor>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CartasDeColor],
    }).compileComponents();

    fixture = TestBed.createComponent(CartasDeColor);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render header and footer', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-header')).toBeTruthy();
    expect(compiled.querySelector('app-footer')).toBeTruthy();
  });

  it('should render the documentation heading', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const heading = compiled.querySelector('.cartas__heading');
    expect(heading?.textContent).toContain('DOCUMENTACIÓN |');
    expect(heading?.textContent).toContain('Cartas de Color');
  });

  it('should render both color cards with download buttons', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll('app-color-card');
    expect(cards.length).toBe(2);

    const buttons = Array.from(
      compiled.querySelectorAll('.color-card__button'),
    ) as HTMLAnchorElement[];
    expect(buttons.map((b) => b.textContent?.trim())).toEqual([
      'Descargar Carta Colom 3000',
      'Descargar Carta Colom Revestimientos',
    ]);
    expect(buttons.map((b) => b.getAttribute('href'))).toEqual([
      '/documentacion/colom-carta-3000.pdf',
      '/documentacion/carta-colom-revestimientos.pdf',
    ]);
  });

  it('should link card images to the expected PDFs', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const links = Array.from(
      compiled.querySelectorAll('.color-card__img-link'),
    ) as HTMLAnchorElement[];
    expect(links.map((a) => a.getAttribute('href'))).toEqual([
      '/documentacion/colom-carta-3000.pdf',
      '/documentacion/carta-colom-revestimientos.pdf',
    ]);
  });

  it('should render a divider between the two cards', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('.cartas__divider').length).toBe(1);
  });
});
