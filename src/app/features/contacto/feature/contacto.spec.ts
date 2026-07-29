import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { ContactoApi } from '../../admin/data/contacto.api';
import { Branch, ContactoPublicPage } from '../../admin/data/admin.models';
import { Contacto } from './contacto';

function makeBranch(overrides: Partial<Branch> & Pick<Branch, 'id'>): Branch {
  return {
    name: 'Sucursal Centro',
    addressLines: ['Calle Ayacucho 168'],
    phone: '+591 3 333-4101',
    email: 'centro@pinturas-colom.bo',
    hours: ['Lun–Vie 08:00–18:00'],
    lat: -17.7833,
    lng: -63.1829,
    imageUrl: null,
    sortOrder: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

const PAGE: ContactoPublicPage = {
  settings: {
    heroImageUrl: '',
    centralAddressLines: [
      'Av. Cristo Redentor 2850',
      'Equipetrol Norte',
      'Santa Cruz de la Sierra',
      'BOLIVIA',
    ],
    centralPhone: '+591 3 344-1200',
    centralWhatsapp: '59133441200',
    centralEmail: 'info@pinturas-colom.bo',
    attentionLabel: 'Atención al Cliente',
    infoRequestLabel: 'Solicitud de Información',
  },
  branches: [
    makeBranch({ id: 1, name: 'Sucursal Centro' }),
    makeBranch({
      id: 2,
      name: 'Sucursal Equipetrol',
      addressLines: ['Av. San Martín 450'],
      lat: -17.7407,
      lng: -63.1659,
      sortOrder: 1,
    }),
  ],
};

describe('Contacto', () => {
  let getPublicSpy: ReturnType<typeof vi.fn>;

  async function setup(opts?: {
    page?: ContactoPublicPage;
    error?: boolean;
  }): Promise<ComponentFixture<Contacto>> {
    getPublicSpy = vi.fn(() =>
      opts?.error
        ? throwError(() => ({
            status: 500,
            code: 'INTERNAL_ERROR',
            message: 'Error interno',
            correlationId: 'corr-1',
          }))
        : of(opts?.page ?? PAGE),
    );

    await TestBed.configureTestingModule({
      imports: [Contacto],
      providers: [{ provide: ContactoApi, useValue: { getPublic: getPublicSpy } }],
    }).compileComponents();

    const fixture = TestBed.createComponent(Contacto);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  it('should create and load public contacto', async () => {
    const fixture = await setup();
    expect(fixture.componentInstance).toBeTruthy();
    expect(getPublicSpy).toHaveBeenCalled();
  });

  it('should render contact hero after load', async () => {
    const fixture = await setup();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-contact-hero')).toBeTruthy();
  });

  it('should render three contact info blocks from settings', async () => {
    const fixture = await setup();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('app-contact-info-block').length).toBe(3);
    expect(compiled.textContent).toContain('Atención al Cliente');
    expect(compiled.textContent).toContain('+591 3 344-1200');
  });

  it('should render branches from API', async () => {
    const fixture = await setup();
    const compiled = fixture.nativeElement as HTMLElement;
    const items = compiled.querySelectorAll('.branch-list__item');
    expect(items.length).toBe(2);
    expect(compiled.textContent).toContain('Sucursal Centro');
    expect(compiled.textContent).toContain('Sucursal Equipetrol');
  });

  it('should show error state and retry', async () => {
    const fixture = await setup({ error: true });
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.contacto__status--error')).toBeTruthy();
    expect(compiled.querySelectorAll('app-contact-info-block').length).toBe(0);

    getPublicSpy.mockReturnValue(of(PAGE));
    const retry = compiled.querySelector('.contacto__retry') as HTMLButtonElement;
    retry.click();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(
      (fixture.nativeElement as HTMLElement).querySelectorAll(
        'app-contact-info-block',
      ).length,
    ).toBe(3);
  });
});
