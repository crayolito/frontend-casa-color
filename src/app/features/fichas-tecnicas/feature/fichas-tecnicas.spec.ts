import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FichasTecnicas } from './fichas-tecnicas';
import { FICHAS_COLUMNS } from '../util/fichas-tecnicas-data';

describe('FichasTecnicas', () => {
  let fixture: ComponentFixture<FichasTecnicas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FichasTecnicas],
    }).compileComponents();

    fixture = TestBed.createComponent(FichasTecnicas);
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

  it('should render the page title inside the hero', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const title = compiled.querySelector('.fichas__title');
    expect(title?.textContent?.trim()).toBe('Fichas Técnicas');
  });

  it('should render three columns', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('app-fichas-column').length).toBe(3);
  });

  it('should render all toggles as fichas-toggle (6+4+5 = 15)', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const expected = FICHAS_COLUMNS.reduce(
      (sum, col) => sum + col.toggles.length,
      0,
    );
    expect(expected).toBe(15);
    expect(compiled.querySelectorAll('app-fichas-toggle').length).toBe(
      expected,
    );
  });

  it('should render PDF links from the first Deco toggle', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const firstToggle = FICHAS_COLUMNS[0].toggles[0];
    const links = Array.from(
      compiled.querySelectorAll('.fichas-column__links a'),
    ) as HTMLAnchorElement[];
    const labels = links.map((a) => a.textContent?.trim());

    for (const pdf of firstToggle.links) {
      expect(labels).toContain(pdf.label);
    }
  });

  it('should map Salient color variants onto toggles', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const toggles = Array.from(
      compiled.querySelectorAll('.fichas-toggle'),
    ) as HTMLElement[];
    expect(toggles[0].getAttribute('data-variant')).toBe('accent');
    expect(toggles[1].getAttribute('data-variant')).toBe('extra-1');
    expect(toggles[2].getAttribute('data-variant')).toBe('extra-2');
    expect(toggles[3].getAttribute('data-variant')).toBe('extra-3');
  });
});
