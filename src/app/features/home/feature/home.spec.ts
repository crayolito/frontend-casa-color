import { ComponentFixture, TestBed } from '@angular/core/testing';
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

  it('should render the find-product heading', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('#find-product-title')?.textContent).toContain(
      'Encuentra un producto',
    );
  });

  it('should render hero slides', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const slides = compiled.querySelectorAll('.hero__slide');
    expect(slides.length).toBe(3);
  });
});
