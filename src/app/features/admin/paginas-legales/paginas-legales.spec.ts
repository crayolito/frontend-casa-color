import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { LegalPageApi } from '../../paginas-legales/data/legal-page.api';
import { LegalPageSettings } from '../../paginas-legales/data/legal-page.model';
import { AdminPaginasLegales } from './paginas-legales';

const AVISO: LegalPageSettings = {
  title: 'Aviso Legal',
  bodyHtml: '<p>Contenido del aviso</p>',
};

const POLITICA: LegalPageSettings = {
  title: 'Política de Datos',
  bodyHtml: '<p>Contenido de política</p>',
};

describe('AdminPaginasLegales', () => {
  let getSpy: ReturnType<typeof vi.fn>;
  let upsertSpy: ReturnType<typeof vi.fn>;

  async function setup(opts?: {
    getError?: { status: number; code: string; message: string };
    getResult?: LegalPageSettings;
  }): Promise<ComponentFixture<AdminPaginasLegales>> {
    const getError = opts?.getError;
    getSpy = vi.fn(() =>
      getError
        ? throwError(() => ({
            code: getError.code,
            message: getError.message,
            status: getError.status,
          }))
        : of({
            settings: opts?.getResult ?? AVISO,
            updatedAt: '2026-07-29T00:00:00.000Z',
          }),
    );
    upsertSpy = vi.fn((key: string, value: LegalPageSettings) =>
      of({
        settings: value,
        updatedAt: '2026-07-29T12:00:00.000Z',
      }),
    );

    await TestBed.configureTestingModule({
      imports: [AdminPaginasLegales],
      providers: [
        { provide: LegalPageApi, useValue: { get: getSpy, upsert: upsertSpy } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(AdminPaginasLegales);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  it('should create and load aviso-legal by default (happy path)', async () => {
    const fixture = await setup();
    const component = fixture.componentInstance;

    expect(component).toBeTruthy();
    expect(getSpy).toHaveBeenCalledWith('aviso-legal');
    expect(component.form.controls.title.value).toBe('Aviso Legal');
    expect(component.form.controls.bodyHtml.value).toBe(
      '<p>Contenido del aviso</p>',
    );
    expect(component.updatedAt()).toBe('2026-07-29T00:00:00.000Z');
  });

  it('should soft-handle 404 and show flash to create', async () => {
    const fixture = await setup({
      getError: {
        status: 404,
        code: 'SITE_SETTING_NOT_FOUND',
        message: 'Configuración no encontrada',
      },
    });
    const component = fixture.componentInstance;

    expect(component.error()).toBeNull();
    expect(component.flash()).toContain('aún no existe');
    expect(component.form.controls.title.value).toBe('Aviso Legal');
    expect(component.form.controls.bodyHtml.value).toBe('');
  });

  it('should save HTML and refresh form', async () => {
    const fixture = await setup();
    const component = fixture.componentInstance;

    component.form.setValue({
      title: 'Aviso Legal actualizado',
      bodyHtml: '<h2>Nuevo</h2><p>Texto</p>',
    });
    component.save();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(upsertSpy).toHaveBeenCalledWith('aviso-legal', {
      title: 'Aviso Legal actualizado',
      bodyHtml: '<h2>Nuevo</h2><p>Texto</p>',
    });
    expect(component.flash()).toBe('Guardado correctamente');
    expect(component.updatedAt()).toBe('2026-07-29T12:00:00.000Z');
  });

  it('should switch tab and load politica-datos', async () => {
    const fixture = await setup();
    getSpy.mockReturnValue(
      of({
        settings: POLITICA,
        updatedAt: '2026-07-28T00:00:00.000Z',
      }),
    );

    fixture.componentInstance.selectKey('politica-datos');
    await fixture.whenStable();
    fixture.detectChanges();

    expect(getSpy).toHaveBeenCalledWith('politica-datos');
    expect(fixture.componentInstance.form.controls.title.value).toBe(
      'Política de Datos',
    );
  });
});
