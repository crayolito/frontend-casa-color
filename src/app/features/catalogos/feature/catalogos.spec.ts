import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_IMAGES } from '../../../shared/util/default-images';
import {
  CatalogosPageApi,
  CatalogosPageContent,
} from '../data/catalogos-page.api';
import { Catalogos } from './catalogos';

const SAMPLE: CatalogosPageContent = {
  imageUrl: '/uploads/catalogo.jpg',
  pdfUrl: '/docs/catalogo.pdf',
  pdfButtonLabel: 'DESCARGAR',
};

describe('Catalogos', () => {
  let getPublicSpy: ReturnType<typeof vi.fn>;

  async function setup(opts?: {
    content?: CatalogosPageContent | null;
    error?: boolean;
  }): Promise<ComponentFixture<Catalogos>> {
    getPublicSpy = vi.fn(() =>
      opts?.error
        ? throwError(() => ({
            status: 500,
            code: 'INTERNAL_ERROR',
            message: 'Error interno',
            correlationId: 'corr-1',
          }))
        : of(opts?.content === undefined ? SAMPLE : opts.content),
    );

    await TestBed.configureTestingModule({
      imports: [Catalogos],
      providers: [
        { provide: CatalogosPageApi, useValue: { getPublic: getPublicSpy } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(Catalogos);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  it('renders image and PDF button from catalogos-page API', async () => {
    const fixture = await setup();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(getPublicSpy).toHaveBeenCalled();
    const img = compiled.querySelector(
      '.catalogos__image',
    ) as HTMLImageElement | null;
    expect(img?.getAttribute('src')).toBe('/uploads/catalogo.jpg');
    const btn = compiled.querySelector(
      '.catalogos__button',
    ) as HTMLAnchorElement | null;
    expect(btn?.getAttribute('href')).toBe('/docs/catalogo.pdf');
    expect(btn?.getAttribute('target')).toBe('_blank');
    expect(btn?.getAttribute('rel')).toBe('noopener');
    expect(btn?.textContent?.trim()).toBe('DESCARGAR');
  });

  it('uses banner fallback when imageUrl is empty', async () => {
    const fixture = await setup({
      content: {
        imageUrl: null,
        pdfUrl: '/docs/a.pdf',
        pdfButtonLabel: 'Ver PDF',
      },
    });
    const img = (fixture.nativeElement as HTMLElement).querySelector(
      '.catalogos__image',
    ) as HTMLImageElement | null;
    expect(img?.getAttribute('src')).toBe(DEFAULT_IMAGES.banner);
  });

  it('hides PDF button when pdfUrl is missing', async () => {
    const fixture = await setup({
      content: {
        imageUrl: '/uploads/only-img.jpg',
        pdfUrl: null,
        pdfButtonLabel: 'DESCARGAR',
      },
    });
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.catalogos__button')).toBeNull();
    expect(compiled.querySelector('.catalogos__image')).toBeTruthy();
  });

  it('shows empty state when image and PDF are both missing', async () => {
    const fixture = await setup({
      content: {
        imageUrl: null,
        pdfUrl: null,
        pdfButtonLabel: 'DESCARGAR',
      },
    });
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.catalogos__status')?.textContent).toContain(
      'Todavía no hay un catálogo',
    );
  });

  it('shows error state and allows retry', async () => {
    const fixture = await setup({ error: true });
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.catalogos__error')).toBeTruthy();
    expect(compiled.querySelector('.catalogos__retry')).toBeTruthy();

    getPublicSpy.mockReturnValueOnce(of(SAMPLE));
    compiled.querySelector('.catalogos__retry')?.dispatchEvent(new Event('click'));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(getPublicSpy).toHaveBeenCalledTimes(2);
    expect(compiled.querySelector('.catalogos__image')).toBeTruthy();
  });
});
