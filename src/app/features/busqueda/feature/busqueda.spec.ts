import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { Busqueda } from './busqueda';

describe('Busqueda', () => {
  let fixture: ComponentFixture<Busqueda>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Busqueda],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(Busqueda);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render header, footer and search results heading', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-header')).toBeTruthy();
    expect(compiled.querySelector('app-footer')).toBeTruthy();
    expect(compiled.querySelector('.busqueda__page-header h1')?.textContent).toContain(
      'Results For',
    );
  });

  it('should render mock search results and sidebar', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('app-search-result-card').length).toBe(5);
    expect(compiled.querySelector('app-search-sidebar-menu')).toBeTruthy();
    expect(compiled.querySelector('.page-numbers .current')?.textContent?.trim()).toBe(
      '1',
    );
  });
});
