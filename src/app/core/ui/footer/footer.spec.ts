import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DEFAULT_IMAGES } from '../../../shared/util/default-images';
import { Footer } from './footer';
import { HomeFooter } from '../../../features/home/data/home-content.model';

const BASE: HomeFooter = {
  logoUrl: '',
  address: [],
  phones: [],
  legalLinks: [],
  social: {
    whatsapp: { show: false },
    instagram: { show: false },
    tiktok: { show: false },
    facebook: { show: false },
  },
  copyright: { text: '©', designBy: 'Crayolito' },
};

describe('Footer', () => {
  let fixture: ComponentFixture<Footer>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Footer],
    }).compileComponents();
    fixture = TestBed.createComponent(Footer);
  });

  it('logoSrc falls back to Casa Color logo when empty', async () => {
    fixture.componentRef.setInput('footer', { ...BASE, logoUrl: '' });
    await fixture.whenStable();
    const img = fixture.nativeElement.querySelector(
      '.footer__logo',
    ) as HTMLImageElement | null;
    expect(img?.getAttribute('src')).toBe(DEFAULT_IMAGES.logo);
  });

  it('uses headerLogoUrl when footer logo is empty', async () => {
    fixture.componentRef.setInput('footer', { ...BASE, logoUrl: '' });
    fixture.componentRef.setInput('headerLogoUrl', '/uploads/header-logo.png');
    await fixture.whenStable();
    const img = fixture.nativeElement.querySelector(
      '.footer__logo',
    ) as HTMLImageElement | null;
    expect(img?.getAttribute('src')).toBe('/uploads/header-logo.png');
  });

  it('does not render section headings or brand tagline', async () => {
    fixture.componentRef.setInput('footer', {
      ...BASE,
      address: ['Calle 1'],
      phones: ['700'],
      legalLinks: [{ label: 'Empresa', href: '/empresa' }],
    });
    await fixture.whenStable();
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.footer__heading')).toBeNull();
    expect(el.querySelector('.footer__tagline')).toBeNull();
    expect(el.textContent).not.toContain('Ubicación');
    expect(el.textContent).not.toContain('Contacto');
    expect(el.textContent).not.toContain('Enlaces');
  });

  it('renders social links in the copyright bar', async () => {
    fixture.componentRef.setInput('footer', {
      ...BASE,
      social: {
        ...BASE.social,
        facebook: { show: true, url: 'https://facebook.com/casa' },
        instagram: { show: true, url: 'https://instagram.com/casa' },
      },
    });
    await fixture.whenStable();
    fixture.detectChanges();
    const copyright = fixture.nativeElement.querySelector(
      '.footer__copyright',
    ) as HTMLElement;
    const links = Array.from(
      copyright.querySelectorAll(
        '.footer__social-link',
      ) as NodeListOf<HTMLAnchorElement>,
    );
    const labels = links.map((a) => a.getAttribute('aria-label'));
    expect(labels).toContain('Facebook');
    expect(labels).toContain('Instagram');
  });

  it('maps legacy twitter to facebook for visibility', async () => {
    fixture.componentRef.setInput('footer', {
      ...BASE,
      social: {
        whatsapp: { show: false },
        instagram: { show: false },
        tiktok: { show: false },
        twitter: { show: true, url: 'https://facebook.com/legacy' },
      } as HomeFooter['social'],
    });
    await fixture.whenStable();
    fixture.detectChanges();
    const fb = fixture.nativeElement.querySelector(
      'a[aria-label="Facebook"]',
    ) as HTMLAnchorElement | null;
    expect(fb?.getAttribute('href')).toBe('https://facebook.com/legacy');
  });
});
