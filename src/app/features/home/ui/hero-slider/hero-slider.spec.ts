import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { HomeBanner } from '../../data/home-content.model';
import { HeroSlider } from './hero-slider';

describe('HeroSlider', () => {
  let fixture: ComponentFixture<HeroSlider>;

  const banner: HomeBanner = {
    autoplay: false,
    intervalMs: 4000,
    slides: [
      {
        id: '1',
        imageUrl: '/a.jpg',
        title: 'Línea Deco',
        buttonText: 'Ver gama',
        buttonLink: '/catalogos',
      },
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroSlider],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroSlider);
    fixture.componentRef.setInput('banner', banner);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the down arrow', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.hero__down-arrow')).not.toBeNull();
  });

  it('should resolve CTA href from buttonLink', () => {
    const href = fixture.componentInstance['slideHref'](banner.slides[0]);
    expect(href).toBe('/catalogos');
  });

  it('keeps white title even with light scheme', () => {
    fixture.componentRef.setInput('banner', {
      ...banner,
      slides: [{ ...banner.slides[0], scheme: 'light' as const }],
    });
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector(
      '.hero__title',
    ) as HTMLElement;
    const slide = fixture.nativeElement.querySelector(
      '.hero__slide',
    ) as HTMLElement;
    expect(slide.classList.contains('hero__slide--light')).toBe(true);
    const color = getComputedStyle(title).color;
    // En test env puede quedar la var sin resolver; nunca debe ser el color de texto oscuro.
    expect(color).not.toBe('var(--color-text)');
    expect(color === 'var(--color-white)' || /255,\s*255,\s*255/.test(color)).toBe(
      true,
    );
  });
});
