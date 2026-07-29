import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { ColorCard } from '../../admin/data/admin.models';
import { ColorCardsApi } from '../../admin/data/color-cards.api';
import { CartasDeColor } from './cartas-de-color';

function makeCard(overrides: Partial<ColorCard> & Pick<ColorCard, 'id'>): ColorCard {
  return {
    imageUrl: '/img/cartas/colom-3000-web.png',
    titlePrefix: 'COLOM',
    titleStrong: ' 3000',
    descriptionHtml: '<p>Descripción de prueba</p>',
    buttonLabel: 'Descargar Carta Colom 3000',
    pdfUrl: '/documentacion/colom-carta-3000.pdf',
    sortOrder: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('CartasDeColor', () => {
  let listPublicSpy: ReturnType<typeof vi.fn>;

  async function setup(opts?: {
    cards?: ColorCard[];
    error?: boolean;
  }): Promise<ComponentFixture<CartasDeColor>> {
    const cards =
      opts?.cards ??
      [
        makeCard({ id: 1 }),
        makeCard({
          id: 2,
          titleStrong: ' Revestimientos',
          descriptionHtml: null,
          buttonLabel: 'Descargar Carta Colom Revestimientos',
          pdfUrl: '/documentacion/carta-colom-revestimientos.pdf',
          imageUrl: '/img/cartas/colom-revestimientos-web.png',
          sortOrder: 1,
        }),
      ];

    listPublicSpy = vi.fn(() =>
      opts?.error
        ? throwError(() => ({
            status: 500,
            code: 'INTERNAL_ERROR',
            message: 'Error interno',
            correlationId: 'corr-1',
          }))
        : of({
            data: cards,
            meta: { page: 1, limit: 50, total: cards.length, totalPages: 1 },
          }),
    );

    await TestBed.configureTestingModule({
      imports: [CartasDeColor],
      providers: [
        { provide: ColorCardsApi, useValue: { listPublic: listPublicSpy } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(CartasDeColor);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  it('should create and render heading', async () => {
    const fixture = await setup();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(fixture.componentInstance).toBeTruthy();
    expect(compiled.querySelector('.cartas__heading')).toBeTruthy();
  });

  it('loads cartas from ColorCardsApi.listPublic', async () => {
    const fixture = await setup();
    expect(listPublicSpy).toHaveBeenCalledWith(1, 50);
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.cartas__heading')?.textContent).toContain(
      'DOCUMENTACIÓN |',
    );
    expect(compiled.querySelector('.cartas__heading')?.textContent).toContain(
      'Cartas de Color',
    );
    expect(compiled.querySelectorAll('app-color-card').length).toBe(2);
  });

  it('renders download buttons with PDF links', async () => {
    const fixture = await setup();
    const compiled = fixture.nativeElement as HTMLElement;
    const buttons = Array.from(
      compiled.querySelectorAll('.color-card__button'),
    ) as HTMLAnchorElement[];
    expect(buttons.map((b) => b.textContent?.trim())).toEqual([
      'Descargar Carta Colom 3000',
      'Descargar Carta Colom Revestimientos',
    ]);
    expect(buttons.map((b) => b.getAttribute('href'))).toEqual([
      '/documentacion/colom-carta-3000.pdf',
      '/documentacion/carta-colom-revestimientos.pdf',
    ]);
  });

  it('renders a divider between cards', async () => {
    const fixture = await setup();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('.cartas__divider').length).toBe(1);
  });

  it('shows empty state when API returns no cards', async () => {
    const fixture = await setup({ cards: [] });
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('app-color-card').length).toBe(0);
    expect(compiled.querySelector('.cartas__status')?.textContent).toContain(
      'Todavía no hay cartas',
    );
  });

  it('shows error state and allows retry', async () => {
    const fixture = await setup({ error: true });
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.cartas__error')).toBeTruthy();
    expect(compiled.querySelector('.cartas__retry')).toBeTruthy();

    listPublicSpy.mockReturnValueOnce(
      of({
        data: [makeCard({ id: 9, buttonLabel: 'Retry OK' })],
        meta: { page: 1, limit: 50, total: 1, totalPages: 1 },
      }),
    );
    compiled.querySelector('.cartas__retry')?.dispatchEvent(new Event('click'));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(listPublicSpy).toHaveBeenCalledTimes(2);
    expect(compiled.querySelectorAll('app-color-card').length).toBe(1);
  });
});
