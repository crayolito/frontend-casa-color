import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { LegalPageApi } from '../data/legal-page.api';
import { LegalPageSettings } from '../data/legal-page.model';
import { PaginaLegal } from './pagina-legal';

const AVISO: LegalPageSettings = {
  title: 'Aviso Legal',
  bodyHtml: '<p>Texto legal de prueba</p>',
};

describe('PaginaLegal', () => {
  let getSpy: ReturnType<typeof vi.fn>;

  async function setup(opts?: {
    settings?: LegalPageSettings;
    error?: { status: number; code: string; message: string };
    key?: string;
  }): Promise<ComponentFixture<PaginaLegal>> {
    getSpy = vi.fn(() =>
      opts?.error
        ? throwError(() => opts.error)
        : of({
            settings: opts?.settings ?? AVISO,
            updatedAt: '2026-07-29T00:00:00.000Z',
          }),
    );

    await TestBed.configureTestingModule({
      imports: [PaginaLegal],
      providers: [{ provide: LegalPageApi, useValue: { get: getSpy } }],
    }).compileComponents();

    const fixture = TestBed.createComponent(PaginaLegal);
    fixture.componentRef.setInput('legalKey', opts?.key ?? 'aviso-legal');
    fixture.componentRef.setInput('title', 'Aviso Legal');
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  it('should load and render HTML (happy path)', async () => {
    const fixture = await setup();
    const compiled = fixture.nativeElement as HTMLElement;

    expect(getSpy).toHaveBeenCalledWith('aviso-legal');
    expect(compiled.querySelector('h1')?.textContent?.trim()).toBe(
      'Aviso Legal',
    );
    expect(compiled.querySelector('.pagina-legal__content')?.innerHTML).toContain(
      'Texto legal de prueba',
    );
  });

  it('should show empty state when page is missing (404)', async () => {
    const fixture = await setup({
      error: {
        status: 404,
        code: 'SITE_SETTING_NOT_FOUND',
        message: 'Configuración no encontrada',
      },
    });
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Próximamente');
    expect(compiled.querySelector('.pagina-legal__content')).toBeNull();
  });

  it('should show empty state when bodyHtml is empty', async () => {
    const fixture = await setup({
      settings: { title: 'Aviso Legal', bodyHtml: '' },
    });
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Próximamente');
  });

  it('should show error and recover on retry', async () => {
    const fixture = await setup({
      error: {
        status: 500,
        code: 'INTERNAL_ERROR',
        message: 'Error interno',
      },
    });
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.pagina-legal__status--error')).toBeTruthy();

    getSpy.mockReturnValue(
      of({
        settings: AVISO,
        updatedAt: '2026-07-29T00:00:00.000Z',
      }),
    );
    const retry = compiled.querySelector(
      '.pagina-legal__retry',
    ) as HTMLButtonElement;
    retry.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const after = fixture.nativeElement as HTMLElement;
    expect(after.querySelector('.pagina-legal__content')?.innerHTML).toContain(
      'Texto legal de prueba',
    );
  });
});
