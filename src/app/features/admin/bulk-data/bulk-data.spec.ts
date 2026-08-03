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

  it('creates and downloads template / export per entity', async () => {
    const fixture = await setup();
    const component = fixture.componentInstance;

    component.downloadTemplate('categories');
    expect(api.downloadTemplate).toHaveBeenCalledWith('categories');

    component.downloadExport('products');
    expect(api.downloadExport).toHaveBeenCalledWith('products');
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
});
