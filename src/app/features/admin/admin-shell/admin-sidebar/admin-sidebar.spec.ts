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

  it('lists Inicio in Configuración and omits Datos del sitio', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).not.toContain('Datos del sitio');
    expect(el.querySelector('a[href="/admin/settings"]')).toBeNull();
    expect(el.querySelector('a[href="/admin/home"]')).not.toBeNull();
    expect(el.textContent).toContain('Inicio');
    expect(el.textContent).toContain('Sucursales');
    expect(el.textContent).toContain('Contacto (página)');
    expect(el.textContent).toContain('Páginas legales');
    expect(el.querySelector('a[href="/admin/paginas-legales"]')).not.toBeNull();
  });
});
