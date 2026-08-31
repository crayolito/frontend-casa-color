import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';
import {
  BulkDataApi,
  BulkEntity,
  ImportResult,
} from '../data/bulk-data.api';
import { AdminToastService } from '../../../shared/admin-ui/admin-toast/admin-toast.service';
import { AdminBulkData } from './bulk-data';

const OK_RESULT: ImportResult = {
  summary: { total: 1, succeeded: 1, failed: 0, skipped: 0 },
  rows: [
    {
      sheet: 'Categories',
      row: 2,
      slug: 'pinturas',
      command: 'MERGE',
      status: 'success',
    },
  ],
};

describe('AdminBulkData', () => {
  let api: {
    downloadTemplate: ReturnType<typeof vi.fn>;
    downloadExport: ReturnType<typeof vi.fn>;
    import: ReturnType<typeof vi.fn>;
  };
  let toast: AdminToastService;

  async function setup(): Promise<ComponentFixture<AdminBulkData>> {
    api = {
      downloadTemplate: vi.fn(() => of(new Blob(['x']))),
      downloadExport: vi.fn(() => of(new Blob(['y']))),
      import: vi.fn(() => of(OK_RESULT)),
    };

    await TestBed.configureTestingModule({
      imports: [AdminBulkData],
      providers: [{ provide: BulkDataApi, useValue: api }],
    }).compileComponents();

    const fixture = TestBed.createComponent(AdminBulkData);
    toast = TestBed.inject(AdminToastService);
    fixture.detectChanges();
    return fixture;
  }

  function prepareImport(
    component: AdminBulkData,
    entity: BulkEntity,
    file: File,
    deleteCount = 0,
  ): void {
    component['patchCard'](entity, {
      selectedFile: file,
      deleteCount,
      scanning: false,
      importing: false,
    });
  }

  it('creates and downloads template; export uses modal flow', async () => {
    const fixture = await setup();
    const component = fixture.componentInstance;

    component.downloadTemplate('categories');
    expect(api.downloadTemplate).toHaveBeenCalledWith('categories');

    component.openExportModal('products');
    component.setExportScope('all');
    component.confirmExport();
    expect(api.downloadExport).toHaveBeenCalledWith('products', undefined);
  });

  it('imports selected file without DELETE modal when deleteCount is 0', async () => {
    const fixture = await setup();
    const component = fixture.componentInstance;
    const file = new File(['fake'], 'data.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    prepareImport(component, 'catalogs', file, 0);

    component.requestImport('catalogs');
    fixture.detectChanges();
    await fixture.whenStable();

    expect(api.import).toHaveBeenCalledWith('catalogs', file);
    expect(component.result()?.summary.succeeded).toBe(1);
    expect(component.confirmDeleteOpen()).toBe(false);
  });

  it('opens confirm dialog when DELETE rows are present', async () => {
    const fixture = await setup();
    const component = fixture.componentInstance;
    const file = new File(['fake'], 'data.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    prepareImport(component, 'categories', file, 2);

    component.requestImport('categories');
    expect(api.import).not.toHaveBeenCalled();
    expect(component.confirmDeleteOpen()).toBe(true);

    component.confirmDeleteImport();
    await fixture.whenStable();
    expect(api.import).toHaveBeenCalledWith('categories', file);
  });

  it('shows toast on import request error via resolveErrorMessage', async () => {
    const fixture = await setup();
    api.import.mockReturnValue(
      throwError(() => ({
        code: 'BULK_FILE_INVALID',
        message: 'raw',
        status: 422,
      })),
    );
    const errorSpy = vi.spyOn(toast, 'error');
    const component = fixture.componentInstance;
    const file = new File(['x'], 'bad.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    prepareImport(component, 'products', file, 0);
    component.requestImport('products');
    await fixture.whenStable();

    expect(errorSpy).toHaveBeenCalled();
    expect(String(errorSpy.mock.calls[0][0])).toContain('Excel');
  });

  it('keeps file selected when excel pre-scan fails', async () => {
    const fixture = await setup();
    const component = fixture.componentInstance;
    const errorSpy = vi.spyOn(toast, 'error');
    const file = new File([new Uint8Array([0, 1, 2, 3])], 'bad.xlsx', {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    component['setFile']('categories', file);
    await new Promise((r) => setTimeout(r, 200));
    fixture.detectChanges();

    expect(errorSpy).not.toHaveBeenCalled();
    expect(component.cardState('categories').selectedFile).toBe(file);
    expect(component.cardState('categories').deleteCount).toBe(0);
  });

  it('rowMessage shows backend detail for BULK_PARSE_CHILDREN', async () => {
    const fixture = await setup();
    const component = fixture.componentInstance;
    const msg = component.rowMessage({
      sheet: 'Products',
      row: 4,
      slug: 'x',
      command: 'MERGE',
      status: 'error',
      code: 'BULK_PARSE_CHILDREN',
      message: 'imagenes: URL inválida "foo"',
    });
    expect(msg).toBe('imagenes: URL inválida "foo"');
  });

  it('rowMessage hides technical backend detail for unknown row codes', async () => {
    const fixture = await setup();
    const component = fixture.componentInstance;
    const msg = component.rowMessage({
      sheet: 'Products',
      row: 2,
      slug: 'x',
      command: 'MERGE',
      status: 'error',
      code: 'SOME_INTERNAL_PARSER',
      message: 'parser exploded at offset 42',
    });
    expect(msg).not.toContain('parser');
    expect(msg).toContain('No se pudo procesar');
  });
});
