import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import { EmpresaContent } from '../data/admin.models';
import { EmpresaApi } from '../data/empresa.api';
import { AdminEmpresa } from './empresa';

const SAMPLE: EmpresaContent = {
  hero: {
    imageUrl: 'https://cdn.example/hero.jpg',
  },
  sections: [
    {
      id: 'sec-1',
      title: 'Historia',
      titleColor: '#dd3333',
      descriptionHtml: '<p>Historia</p>',
      sideImageUrl: 'https://cdn.example/side.jpg',
      sortOrder: 0,
    },
  ],
};

describe('AdminEmpresa', () => {
  let fixture: ComponentFixture<AdminEmpresa>;
  let upsertSpy: ReturnType<typeof vi.fn>;
  let getSpy: ReturnType<typeof vi.fn>;

  async function setup(opts?: {
    error?: boolean;
    content?: EmpresaContent;
  }): Promise<void> {
    getSpy = vi.fn(() =>
      opts?.error
        ? throwError(() => ({
            status: 500,
            code: 'INTERNAL_ERROR',
            message: 'Error interno',
            correlationId: 'corr-emp',
          }))
        : of(opts?.content ?? SAMPLE),
    );
    upsertSpy = vi.fn((body: EmpresaContent) => of(body));

    await TestBed.configureTestingModule({
      imports: [AdminEmpresa],
      providers: [
        { provide: EmpresaApi, useValue: { getPublic: getSpy, upsert: upsertSpy } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminEmpresa);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  }

  it('loads content and renders section cards', async () => {
    await setup();
    const el = fixture.nativeElement as HTMLElement;
    expect(getSpy).toHaveBeenCalled();
    expect(el.querySelectorAll('.empresa-admin__card').length).toBe(1);
    expect(el.textContent).toContain('Historia');
  });

  it('opens edit modal when Editar is clicked', async () => {
    await setup();
    const cmp = fixture.componentInstance;
    expect(cmp.sectionModalOpen()).toBe(false);
    cmp.openEditSection(0);
    fixture.detectChanges();
    expect(cmp.sectionModalOpen()).toBe(true);
    expect(cmp.sectionEditIndex()).toBe(0);
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-admin-modal')).toBeTruthy();
  });

  it('adds a section up to max 5 and opens modal', async () => {
    await setup();
    const cmp = fixture.componentInstance;
    cmp.openAddSection();
    expect(cmp.sectionsFA.length).toBe(2);
    expect(cmp.sectionModalOpen()).toBe(true);
  });

  it('save sends sections without largeImageUrl', async () => {
    await setup();
    const cmp = fixture.componentInstance;
    cmp.sectionGroup(0).patchValue({ title: 'Nuestra historia' });
    cmp.save();
    expect(upsertSpy).toHaveBeenCalled();
    const body = upsertSpy.mock.calls[0][0] as EmpresaContent;
    expect(body.hero.imageUrl).toBe('https://cdn.example/hero.jpg');
    expect(body.sections).toHaveLength(1);
    expect(body.sections[0]).toMatchObject({
      title: 'Nuestra historia',
      titleColor: '#dd3333',
      sortOrder: 0,
      sideImageUrl: 'https://cdn.example/side.jpg',
    });
    expect(body.sections[0].largeImageUrl).toBeUndefined();
  });

  it('shows error state with retry on load failure', async () => {
    await setup({ error: true });
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('app-admin-error-state')).toBeTruthy();
    fixture.componentInstance.load();
    expect(getSpy.mock.calls.length).toBeGreaterThanOrEqual(2);
  });
});
