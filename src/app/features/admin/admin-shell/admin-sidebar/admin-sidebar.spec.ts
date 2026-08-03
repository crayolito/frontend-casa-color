import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AdminSidebar } from './admin-sidebar';

describe('AdminSidebar', () => {
  let fixture: ComponentFixture<AdminSidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminSidebar],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(AdminSidebar);
    fixture.detectChanges();
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
    expect(el.querySelector('a[href="/admin/settings"]')).toBeNull();
    expect(el.querySelector('a[href="/admin/branches"]')).toBeNull();

    expect(el.querySelector('a[href="/admin/products"]')).not.toBeNull();
    expect(el.querySelector('a[href="/admin/categories"]')).not.toBeNull();
    expect(el.querySelector('a[href="/admin/catalogs"]')).not.toBeNull();
    expect(el.querySelector('a[href="/admin/bulk-data"]')).not.toBeNull();
    expect(el.textContent).toContain('Importar / Exportar');

    expect(el.querySelector('a[href="/admin/home"]')).not.toBeNull();
    expect(el.querySelector('a[href="/admin/empresa"]')).not.toBeNull();
    expect(el.querySelector('a[href="/admin/contacto"]')).not.toBeNull();
    expect(el.querySelector('a[href="/admin/catalogos-page"]')).not.toBeNull();
    expect(el.querySelector('a[href="/admin/color-cards"]')).not.toBeNull();
    expect(el.querySelector('a[href="/admin/fichas-tecnicas"]')).not.toBeNull();
    expect(el.querySelector('a[href="/admin/paginas-legales"]')).not.toBeNull();

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
    expect(pageHrefs).toContain('/admin/catalogos-page');
    expect(pageHrefs).not.toContain('/admin/catalogs');
  });
});
