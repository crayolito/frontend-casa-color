import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { HomeApi } from '../../../../features/home/data/home.api';
import { HomeContent } from '../../../../features/home/data/home-content.model';
import { AdminSidebar } from './admin-sidebar';

const HOME_WITHOUT_LOGO = {
  header: { imageUrl: '', link: '/' },
} as unknown as HomeContent;

const HOME_WITH_LOGO = {
  header: { imageUrl: '/logo.png', altText: 'Logo Casa Color', link: '/' },
} as unknown as HomeContent;

describe('AdminSidebar', () => {
  let fixture: ComponentFixture<AdminSidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminSidebar],
      providers: [
        provideRouter([]),
        { provide: HomeApi, useValue: { loadHome: () => of(HOME_WITHOUT_LOGO) } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(AdminSidebar);
    fixture.detectChanges();
  });

  it('brands the sidebar with "Panel de gestión" when no logo is configured', () => {
    const el = fixture.nativeElement as HTMLElement;
    const label = el.querySelector('.admin-sidebar__brand-label');
    expect(label).not.toBeNull();
    expect(label?.textContent?.trim()).toBe('Panel de gestión');
    expect(el.querySelector('.admin-sidebar__mark')).toBeNull();
    expect(el.textContent).not.toContain('Casa Color');
    expect(el.textContent).not.toContain('CC');
  });

  it('renders the site logo in the brand when the home header has one', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [AdminSidebar],
      providers: [
        provideRouter([]),
        { provide: HomeApi, useValue: { loadHome: () => of(HOME_WITH_LOGO) } },
      ],
    }).compileComponents();
    const withLogo = TestBed.createComponent(AdminSidebar);
    withLogo.detectChanges();

    const img = withLogo.nativeElement.querySelector(
      'img.admin-sidebar__logo-img',
    ) as HTMLImageElement;
    expect(img).not.toBeNull();
    expect(img.src).toContain('/logo.png');
    expect(img.alt).toBe('Logo Casa Color');
    expect(
      withLogo.nativeElement.querySelector('.admin-sidebar__brand-label'),
    ).toBeNull();
  });

  it('shows a palette icon instead of the logo when collapsed', () => {
    fixture.componentRef.setInput('collapsed', true);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.admin-sidebar__mark-icon')).not.toBeNull();
    expect(el.querySelector('img.admin-sidebar__logo-img')).toBeNull();
    expect(el.querySelector('.admin-sidebar__brand-label')).toBeNull();
  });

  it('does not render sesión activa footer', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).not.toContain('Sesión activa');
    expect(el.querySelector('.admin-sidebar__footer')).toBeNull();
  });

  it('separates Catálogo dinámico from Páginas estáticas', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).not.toContain('Datos del sitio');
    expect(el.textContent).not.toContain('Documentación');
    expect(el.textContent).not.toContain('Configuración');
    expect(el.textContent).not.toContain('Sucursales');
    expect(el.querySelector('a[href="/ccadm/settings"]')).toBeNull();
    expect(el.querySelector('a[href="/ccadm/branches"]')).toBeNull();

    expect(el.querySelector('a[href="/ccadm/products"]')).not.toBeNull();
    expect(el.querySelector('a[href="/ccadm/categories"]')).not.toBeNull();
    expect(el.querySelector('a[href="/ccadm/catalogs"]')).not.toBeNull();
    expect(el.querySelector('a[href="/ccadm/bulk-data"]')).not.toBeNull();
    expect(el.textContent).toContain('Importar / Exportar');

    expect(el.querySelector('a[href="/ccadm/home"]')).not.toBeNull();
    expect(el.querySelector('a[href="/ccadm/empresa"]')).not.toBeNull();
    expect(el.querySelector('a[href="/ccadm/contacto"]')).not.toBeNull();
    expect(el.querySelector('a[href="/ccadm/catalogos-page"]')).not.toBeNull();
    expect(el.querySelector('a[href="/ccadm/color-cards"]')).not.toBeNull();
    expect(el.querySelector('a[href="/ccadm/fichas-tecnicas"]')).not.toBeNull();
    expect(el.querySelector('a[href="/ccadm/paginas-legales"]')).not.toBeNull();

    expect(el.textContent).toContain('Catálogo');
    expect(el.textContent).toContain('Páginas');
    expect(el.textContent).toContain('Contacto');
    expect(el.textContent).toContain('Catálogos');
    expect(el.textContent).toContain('Legales');
    expect(el.textContent).not.toContain('Landing catálogos');
    expect(el.textContent).not.toContain('Catálogos (página)');
    expect(el.textContent).not.toContain('Página Catálogos');
    expect(el.textContent).not.toContain('Contacto (página)');
    expect(el.textContent).not.toContain('Páginas legales');

    const labels = Array.from(
      el.querySelectorAll('.admin-sidebar__group-label'),
    );
    const pagesLabel = labels.find((n) => n.textContent?.trim() === 'Páginas');
    expect(pagesLabel).toBeTruthy();
    let node: Element | null = pagesLabel?.nextElementSibling ?? null;
    const pageHrefs: string[] = [];
    while (node && !node.classList.contains('admin-sidebar__group-label')) {
      if (node instanceof HTMLAnchorElement) {
        pageHrefs.push(node.getAttribute('href') ?? '');
      }
      node = node.nextElementSibling;
    }
    expect(pageHrefs).toContain('/ccadm/catalogos-page');
    expect(pageHrefs).not.toContain('/ccadm/catalogs');
  });
});
