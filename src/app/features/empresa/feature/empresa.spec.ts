import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { EmpresaPublicApi } from '../data/empresa.api';
import { EmpresaContent } from '../data/empresa.model';
import { Empresa } from './empresa';

function makeContent(sectionCount: number): EmpresaContent {
  return {
    hero: {
      imageUrl: 'https://cdn.example/hero.jpg',
    },
    sections: Array.from({ length: sectionCount }, (_, i) => ({
      id: `sec-${i}`,
      title: `Sección ${i + 1}`,
      titleColor: '#dd3333',
      descriptionHtml: `<p>Texto ${i + 1}</p>`,
      sideImageUrl: i === 0 ? 'https://cdn.example/side.jpg' : '',
      sortOrder: i,
    })),
  };
}

describe('Empresa', () => {
  let getSpy: ReturnType<typeof vi.fn>;

  async function setup(opts?: {
    content?: EmpresaContent;
    error?: boolean;
  }): Promise<ComponentFixture<Empresa>> {
    getSpy = vi.fn(() =>
      opts?.error
        ? throwError(() => ({
            status: 500,
            code: 'INTERNAL_ERROR',
            message: 'Error interno',
            correlationId: 'corr-emp-public',
          }))
        : of(opts?.content ?? makeContent(2)),
    );

    await TestBed.configureTestingModule({
      imports: [Empresa],
      providers: [
        { provide: EmpresaPublicApi, useValue: { getPublic: getSpy } },
      ],
    }).compileComponents();

    const fixture = TestBed.createComponent(Empresa);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    return fixture;
  }

  it('renders hero, side logo once, and N section titles', async () => {
    const fixture = await setup({ content: makeContent(3) });
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-empresa-hero')).toBeTruthy();
    expect(el.querySelectorAll('.empresa__side-img').length).toBe(1);
    expect(el.querySelectorAll('app-empresa-section').length).toBe(3);
    expect(el.textContent).toContain('Sección 1');
  });

  it('uses 33/67 row layout classes', async () => {
    const fixture = await setup({ content: makeContent(1) });
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.empresa__side')).toBeTruthy();
    expect(el.querySelector('.empresa__main')).toBeTruthy();
    expect(el.querySelector('.empresa-section__divider')).toBeTruthy();
  });

  it('renders zero sections without crashing', async () => {
    const fixture = await setup({ content: makeContent(0) });
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-empresa-hero')).toBeTruthy();
    expect(el.querySelectorAll('app-empresa-section').length).toBe(0);
  });

  it('shows retry on error and reloads', async () => {
    const fixture = await setup({ error: true });
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.empresa__error')).toBeTruthy();
    expect(el.textContent).toContain('Reintentar');
    fixture.componentInstance['load']();
    expect(getSpy.mock.calls.length).toBeGreaterThanOrEqual(2);
  });

  it('sanitizes description HTML via safeHtml pipe (no raw script render)', async () => {
    const fixture = await setup({
      content: {
        hero: { imageUrl: '' },
        sections: [
          {
            id: 'xss',
            title: 'XSS',
            descriptionHtml: '<p>ok</p><script>alert(1)</script>',
            sortOrder: 0,
          },
        ],
      },
    });
    const el = fixture.nativeElement as HTMLElement;
    expect(el.innerHTML).toContain('ok');
    expect(el.querySelector('script')).toBeNull();
  });
});
