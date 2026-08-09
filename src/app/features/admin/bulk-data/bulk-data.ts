import {
  Component,
  ChangeDetectionStrategy,
  DestroyRef,
  inject,
  signal,
  computed,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, of } from 'rxjs';
import {
  BulkDataApi,
  BulkEntity,
  ImportResult,
  ImportRowResult,
} from '../data/bulk-data.api';
import { AdminPageHeader } from '../../../shared/admin-ui/admin-page-header/admin-page-header';
import { AdminButton } from '../../../shared/admin-ui/admin-button/admin-button';
import { AdminIcon } from '../../../shared/admin-ui/icons/admin-icon';
import { AdminConfirmDialog } from '../../../shared/admin-ui/admin-confirm-dialog/admin-confirm-dialog';
import { AdminToastService } from '../../../shared/admin-ui/admin-toast/admin-toast.service';
import { resolveErrorMessage } from '../../../shared/errors/resolve-error-message';
import { messageForCode } from '../../../shared/errors/error-messages';
import { downloadBlob } from './download-blob';
import { PRODUCT_SECTION_ICONS } from '../data/admin.models';

interface EntityCardConfig {
  entity: BulkEntity;
  title: string;
  description: string;
  templateFilename: string;
  exportFilename: string;
}

interface EntityCardState {
  selectedFile: File | null;
  downloadingTemplate: boolean;
  downloadingExport: boolean;
  importing: boolean;
  scanning: boolean;
  deleteCount: number;
  dragOver: boolean;
}

const ENTITY_CARDS: EntityCardConfig[] = [
  {
    entity: 'categories',
    title: 'Categorías',
    description:
      'Grupos principales del catálogo. Importá o exportá solo categorías, una hoja por archivo.',
    templateFilename: 'plantilla-categorias.xlsx',
    exportFilename: 'export-categorias.xlsx',
  },
  {
    entity: 'catalogs',
    title: 'Catálogos',
    description:
      'Colecciones dentro de una categoría. Cada fila referencia la categoría padre por slug.',
    templateFilename: 'plantilla-catalogos.xlsx',
    exportFilename: 'export-catalogos.xlsx',
  },
  {
    entity: 'products',
    title: 'Productos',
    description:
      'Productos del catálogo. Podés asignar varios catálogos separados por coma; el primero es el principal.',
    templateFilename: 'plantilla-productos.xlsx',
    exportFilename: 'export-productos.xlsx',
  },
];

function initialCardState(): EntityCardState {
  return {
    selectedFile: null,
    downloadingTemplate: false,
    downloadingExport: false,
    importing: false,
    scanning: false,
    deleteCount: 0,
    dragOver: false,
  };
}

@Component({
  selector: 'app-admin-bulk-data',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AdminPageHeader, AdminButton, AdminConfirmDialog, AdminIcon],
  templateUrl: './bulk-data.html',
  styleUrl: './bulk-data.css',
})
export class AdminBulkData {
  private readonly api = inject(BulkDataApi);
  private readonly toast = inject(AdminToastService);
  private readonly destroyRef = inject(DestroyRef);

  readonly cards = ENTITY_CARDS;

  /** Guía visual numerada (1-10) para las columnas secciones/imagenes del Excel. */
  readonly productIconGuide = PRODUCT_SECTION_ICONS.map((icon, i) => ({
    ...icon,
    number: i + 1,
  }));

  readonly cardStates = signal<Record<BulkEntity, EntityCardState>>({
    categories: initialCardState(),
    catalogs: initialCardState(),
    products: initialCardState(),
  });

  readonly result = signal<ImportResult | null>(null);
  readonly lastImportEntity = signal<BulkEntity | null>(null);
  readonly confirmDeleteOpen = signal(false);
  readonly pendingImport = signal<{ entity: BulkEntity; file: File } | null>(
    null,
  );

  readonly hasResult = computed(() => (this.result()?.rows.length ?? 0) > 0);

  readonly summaryText = computed(() => {
    const s = this.result()?.summary;
    if (!s) return null;
    return `${s.succeeded} correctas · ${s.failed} con error · ${s.skipped} omitidas · ${s.total} total`;
  });

  readonly deleteConfirmMessage = computed(() => {
    const pending = this.pendingImport();
    if (!pending) return '';
    const state = this.cardStates()[pending.entity];
    return `Vas a importar ${state.deleteCount} fila(s) DELETE en ${this.entityLabel(pending.entity)}. Esta acción usa CASCADE y no se puede deshacer.`;
  });

  cardState(entity: BulkEntity): EntityCardState {
    return this.cardStates()[entity];
  }

  entityLabel(entity: BulkEntity): string {
    return this.cards.find((c) => c.entity === entity)?.title ?? entity;
  }

  onFileSelected(entity: BulkEntity, event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    this.setFile(entity, file);
    input.value = '';
  }

  onDragOver(entity: BulkEntity, event: DragEvent): void {
    event.preventDefault();
    this.patchCard(entity, { dragOver: true });
  }

  onDragLeave(entity: BulkEntity, event: DragEvent): void {
    event.preventDefault();
    this.patchCard(entity, { dragOver: false });
  }

  onDrop(entity: BulkEntity, event: DragEvent): void {
    event.preventDefault();
    this.patchCard(entity, { dragOver: false });
    const file = event.dataTransfer?.files?.[0] ?? null;
    if (file) this.setFile(entity, file);
  }

  downloadTemplate(entity: BulkEntity): void {
    const config = this.cards.find((c) => c.entity === entity)!;
    this.patchCard(entity, { downloadingTemplate: true });
    this.api
      .downloadTemplate(entity)
      .pipe(
        catchError((err: unknown) => {
          this.showError(err);
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((blob) => {
        this.patchCard(entity, { downloadingTemplate: false });
        if (blob) downloadBlob(blob, config.templateFilename);
      });
  }

  downloadExport(entity: BulkEntity): void {
    const config = this.cards.find((c) => c.entity === entity)!;
    this.patchCard(entity, { downloadingExport: true });
    this.api
      .downloadExport(entity)
      .pipe(
        catchError((err: unknown) => {
          this.showError(err);
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((blob) => {
        this.patchCard(entity, { downloadingExport: false });
        if (blob) {
          downloadBlob(blob, config.exportFilename);
          this.toast.success(`${config.title}: export descargado`);
        }
      });
  }

  requestImport(entity: BulkEntity): void {
    const state = this.cardState(entity);
    const file = state.selectedFile;
    if (!file || state.importing || state.scanning) return;

    if (state.deleteCount > 0) {
      this.pendingImport.set({ entity, file });
      this.confirmDeleteOpen.set(true);
      return;
    }
    this.runImport(entity, file);
  }

  cancelDeleteConfirm(): void {
    this.confirmDeleteOpen.set(false);
    this.pendingImport.set(null);
  }

  confirmDeleteImport(): void {
    const pending = this.pendingImport();
    this.confirmDeleteOpen.set(false);
    this.pendingImport.set(null);
    if (pending) this.runImport(pending.entity, pending.file);
  }

  downloadReport(): void {
    const rows = this.result()?.rows ?? [];
    if (rows.length === 0) return;
    const csv = [
      'hoja,fila,slug,comando,estado,codigo,mensaje',
      ...rows.map((r) =>
        [
          r.sheet,
          r.row,
          r.slug ?? '',
          r.command,
          r.status,
          r.code ?? '',
          (r.message ?? '').replace(/"/g, '""'),
        ]
          .map((c) => `"${c}"`)
          .join(','),
      ),
    ].join('\n');
    downloadBlob(
      new Blob([csv], { type: 'text/csv;charset=utf-8' }),
      'casa-color-import-report.csv',
    );
  }

  rowMessage(row: ImportRowResult): string {
    if (row.code) {
      return messageForCode(row.code) ?? row.message ?? row.code;
    }
    return row.message ?? row.status;
  }

  statusLabel(status: ImportRowResult['status']): string {
    if (status === 'success') return 'Correcto';
    if (status === 'error') return 'Error';
    return 'Omitida';
  }

  private setFile(entity: BulkEntity, file: File | null): void {
    this.patchCard(entity, {
      selectedFile: file,
      deleteCount: 0,
    });
    this.result.set(null);
    if (file) void this.scanDeleteCount(entity, file);
  }

  private runImport(entity: BulkEntity, file: File): void {
    this.patchCard(entity, { importing: true });
    this.result.set(null);
    this.lastImportEntity.set(entity);
    this.api
      .import(entity, file)
      .pipe(
        catchError((err: unknown) => {
          this.showError(err);
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((data) => {
        this.patchCard(entity, { importing: false });
        if (!data) return;
        this.result.set(data);
        const label = this.entityLabel(entity);
        if (data.summary.failed === 0) {
          this.toast.success(
            `${label}: ${data.summary.succeeded} filas procesadas`,
          );
        } else {
          this.toast.error(
            `${label}: ${data.summary.failed} errores de ${data.summary.total}`,
          );
        }
      });
  }

  private async scanDeleteCount(
    entity: BulkEntity,
    file: File,
  ): Promise<void> {
    this.patchCard(entity, { scanning: true });
    try {
      const ExcelJS = await import('exceljs');
      const wb = new ExcelJS.Workbook();
      await wb.xlsx.load(await file.arrayBuffer());
      let count = 0;
      for (const ws of wb.worksheets) {
        if (ws.name === 'LEEME') continue;
        const headerRow = ws.getRow(1);
        let commandCol = 0;
        headerRow.eachCell((cell, col) => {
          const h = String(cell.value ?? '').trim().toLowerCase();
          if (h === 'comando' || h === 'command') commandCol = col;
        });
        if (!commandCol) continue;
        ws.eachRow({ includeEmpty: false }, (row, rowNumber) => {
          if (rowNumber === 1) return;
          const cmd = String(row.getCell(commandCol).value ?? '')
            .trim()
            .toUpperCase();
          if (cmd === 'DELETE') count += 1;
        });
      }
      this.patchCard(entity, { deleteCount: count });
    } catch {
      this.patchCard(entity, { deleteCount: 0 });
    } finally {
      this.patchCard(entity, { scanning: false });
    }
  }

  private patchCard(
    entity: BulkEntity,
    patch: Partial<EntityCardState>,
  ): void {
    this.cardStates.update((all) => ({
      ...all,
      [entity]: { ...all[entity], ...patch },
    }));
  }

  private showError(err: unknown): void {
    const resolved = resolveErrorMessage(err);
    this.toast.error(resolved.text);
  }
}
