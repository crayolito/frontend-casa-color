import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Header } from './header';

describe('Header', () => {
  let fixture: ComponentFixture<Header>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('renders dynamicNav labels when provided', () => {
    fixture = TestBed.createComponent(Header);
    fixture.componentRef.setInput('dynamicNav', [
      {
        id: '1',
        label: 'Decoración',
        destination: { type: 'category', slug: 'decoracion' },
        children: [],
      },
      {
        id: '2',
        label: 'Contacto',
        destination: { type: 'page', slug: 'contacto' },
        children: [],
      },
    ]);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Decoración');
    expect(el.textContent).toContain('Contacto');
  });

  it('falls back to legacy NAV_ITEMS when dynamicNav is empty', () => {
    fixture = TestBed.createComponent(Header);
    fixture.componentRef.setInput('dynamicNav', []);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.header__nav')).toBeTruthy();
    expect(el.querySelectorAll('.header__item').length).toBeGreaterThan(0);
  });

  it('opens search overlay on search button click', () => {
    fixture = TestBed.createComponent(Header);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    const btn = el.querySelector<HTMLButtonElement>(
      '.header__icon-btn--search',
    );
    expect(btn).toBeTruthy();
    btn!.click();
    fixture.detectChanges();
    expect(el.querySelector('app-search-overlay')).toBeTruthy();
  });
});
