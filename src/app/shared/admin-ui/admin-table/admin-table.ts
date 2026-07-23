import {
  Component,
  ChangeDetectionStrategy,
  computed,
  input,
  output,
} from '@angular/core';
import { PaginatedMeta } from '../../../core/http/api.service';
import { AdminButton } from '../admin-button/admin-button';
import { AdminIcon, type AdminIconName } from '../icons/admin-icon';

export type AdminBadgeTone = 'success' | 'danger' | 'neutral' | 'info';

export interface AdminTableCellEvent<T> {
  row: T;
  key: string;
}

export interface AdminTableColumn<T> {
  key: string;
  label: string;
  cell: (row: T) => string;
  /** Si se define, la celda se renderiza como badge en lugar de texto plano. */
  badge?: (row: T) => { label: string; tone: AdminBadgeTone } | null;
  /** Si se define, la celda muestra un thumbnail (prioridad sobre badge/texto). */
  image?: (row: T) => string | null | undefined;
  /** Truncar texto largo con ellipsis. */
  truncate?: boolean;
  /** Si true, badge/texto se renderiza como botón y emite cellClick. */
  click?: boolean;
  /** Botón chico al lado del valor; emite cellAction. */
  action?: { icon: AdminIconName; label: string };
}

@Component({
  selector: 'app-admin-table',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AdminButton, AdminIcon],
  template: `
    <div class="admin-table-wrap" [attr.aria-busy]="loading() && rows().length === 0">
      @if (loading() && rows().length === 0) {
        <table class="admin-table" aria-hidden="true">
          <thead>
            <tr>
              @if (selectable()) {
                <th class="admin-table__check-col" scope="col">
                  <span class="admin-skel admin-skel--check"></span>
                </th>
              }
              @for (col of columns(); track col.key) {
                <th scope="col">{{ col.label }}</th>
              }
              @if (showActions()) {
                <th scope="col">Acciones</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (_ of skeletonRows; track $index) {
              <tr>
                @if (selectable()) {
                  <td class="admin-table__check-col">
                    <span class="admin-skel admin-skel--check"></span>
                  </td>
                }
                @for (col of columns(); track col.key) {
                  <td><span class="admin-skel"></span></td>
                }
                @if (showActions()) {
                  <td><span class="admin-skel admin-skel--sm"></span></td>
                }
              </tr>
            }
          </tbody>
        </table>
      } @else if (rows().length === 0) {
        <div class="admin-table__empty">
          <app-admin-icon name="search" [size]="40" />
          <p>{{ emptyMessage() }}</p>
        </div>
      } @else {
        <table class="admin-table" [class.admin-table--refreshing]="loading()">
          <thead>
            <tr>
              @if (selectable()) {
                <th class="admin-table__check-col" scope="col">
                  <input
                    type="checkbox"
                    class="admin-table__checkbox"
                    [checked]="allPageSelected()"
                    [indeterminate]="somePageSelected() && !allPageSelected()"
                    (change)="toggleSelectAll($event)"
                    aria-label="Seleccionar todos de esta página"
                  />
                </th>
              }
              @for (col of columns(); track col.key) {
                <th scope="col">{{ col.label }}</th>
              }
              @if (showActions()) {
                <th scope="col">Acciones</th>
              }
            </tr>
          </thead>
          <tbody>
            @for (row of rows(); track trackBy()(row)) {
              <tr [class.admin-table__row--selected]="isSelected(row)">
                @if (selectable()) {
                  <td class="admin-table__check-col">
                    <input
                      type="checkbox"
                      class="admin-table__checkbox"
                      [checked]="isSelected(row)"
                      (change)="toggleRow(row, $event)"
                      [attr.aria-label]="'Seleccionar fila'"
                    />
                  </td>
                }
                @for (col of columns(); track col.key) {
                  <td
                    [class.admin-table__cell--truncate]="!!col.truncate"
                    [class.admin-table__cell--image]="!!col.image"
                  >
                    @if (col.image; as imageFn) {
                      @if (imageFn(row); as src) {
                        <img
                          class="admin-table__thumb"
                          [src]="src"
                          alt=""
                          width="40"
                          height="40"
                        />
                      } @else {
                        <span class="admin-table__thumb-empty" aria-hidden="true">
                          <app-admin-icon name="image" [size]="18" />
                        </span>
                      }
                    } @else {
                      <span class="admin-table__cell-inner">
                        @if (col.click) {
                          <button
                            type="button"
                            class="admin-table__cell-btn"
                            (click)="cellClick.emit({ row, key: col.key })"
                          >
                            @if (col.badge; as badgeFn) {
                              @if (badgeFn(row); as b) {
                                <span class="admin-badge" [attr.data-tone]="b.tone">{{ b.label }}</span>
                              } @else {
                                {{ col.cell(row) }}
                              }
                            } @else {
                              {{ col.cell(row) }}
                            }
                          </button>
                        } @else if (col.badge; as badgeFn) {
                          @if (badgeFn(row); as b) {
                            <span class="admin-badge" [attr.data-tone]="b.tone">{{ b.label }}</span>
                          } @else {
                            {{ col.cell(row) }}
                          }
                        } @else {
                          <span>{{ col.cell(row) }}</span>
                        }
                        @if (col.action; as act) {
                          <button
                            type="button"
                            class="admin-table__action-mini"
                            [attr.aria-label]="act.label"
                            [title]="act.label"
                            (click)="cellAction.emit({ row, key: col.key })"
                          >
                            <app-admin-icon [name]="act.icon" [size]="12" />
                          </button>
                        }
                      </span>
                    }
                  </td>
                }
                @if (showActions()) {
                  <td class="admin-table__actions">
                    @if (showToggle()) {
                      <button
                        type="button"
                        class="admin-table__icon-btn"
                        [attr.aria-label]="isActive()(row) ? 'Desactivar' : 'Activar'"
                        [title]="isActive()(row) ? 'Desactivar' : 'Activar'"
                        (click)="toggle.emit(row)"
                      >
                        <app-admin-icon [name]="isActive()(row) ? 'eye' : 'eye-off'" />
                      </button>
                    }
                    <button
                      type="button"
                      class="admin-table__icon-btn"
                      aria-label="Editar"
                      title="Editar"
                      (click)="edit.emit(row)"
                    >
                      <app-admin-icon name="edit" />
                    </button>
                    <button
                      type="button"
                      class="admin-table__icon-btn admin-table__icon-btn--danger"
                      aria-label="Eliminar permanente"
                      title="Eliminar permanente"
                      (click)="remove.emit(row)"
                    >
                      <app-admin-icon name="trash" />
                    </button>
                  </td>
                }
              </tr>
            }
          </tbody>
        </table>
      }

      @if (meta(); as m) {
        <div class="admin-table__pager">
          <p class="admin-table__meta">
            Página {{ m.page }} de {{ m.totalPages || 1 }} · {{ m.total }} total
          </p>
          <div class="admin-table__pager-actions">
            <app-admin-button
              variant="secondary"
              type="button"
              [disabled]="m.page <= 1 || loading()"
              (clicked)="pageChange.emit(m.page - 1)"
            >
              Anterior
            </app-admin-button>
            <app-admin-button
              variant="secondary"
              type="button"
              [disabled]="m.page >= m.totalPages || loading()"
              (clicked)="pageChange.emit(m.page + 1)"
            >
              Siguiente
            </app-admin-button>
          </div>
        </div>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .admin-table-wrap {
      background: var(--color-white);
      border: 1px solid var(--admin-border);
      border-radius: var(--radius-lg);
      box-shadow: var(--admin-card-shadow);
      overflow: hidden;
    }

    .admin-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.875rem;
    }

    .admin-table--refreshing {
      opacity: 0.72;
    }

    .admin-table th,
    .admin-table td {
      padding: 0.55rem 0.875rem;
      height: var(--admin-row-h, 44px);
      text-align: left;
      border-bottom: 1px solid var(--admin-border);
      vertical-align: middle;
    }

    .admin-table tbody tr:last-child td {
      border-bottom: 0;
    }

    .admin-table tbody tr {
      transition: background-color 0.15s ease;
    }

    .admin-table tbody tr:hover {
      background: rgba(221, 51, 51, 0.03);
    }

    .admin-table__row--selected {
      background: rgba(221, 51, 51, 0.05);
    }

    .admin-table th {
      font-size: 0.6875rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--color-text-muted);
      background: #fafafa;
      height: auto;
      padding-top: 0.625rem;
      padding-bottom: 0.625rem;
    }

    .admin-table__check-col {
      width: 44px;
      padding-left: 0.75rem;
      padding-right: 0.25rem;
    }

    .admin-table__checkbox {
      width: 16px;
      height: 16px;
      margin: 0;
      cursor: pointer;
      accent-color: var(--color-accent);
    }

    .admin-table__cell--truncate {
      max-width: 220px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .admin-table__cell--image {
      width: 56px;
      padding-top: 0.4rem;
      padding-bottom: 0.4rem;
    }

    .admin-table__thumb {
      display: block;
      width: 40px;
      height: 40px;
      object-fit: cover;
      border-radius: var(--radius-sm);
      border: 1px solid var(--admin-border);
      background: #f5f5f5;
    }

    .admin-table__thumb-empty {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      border-radius: var(--radius-sm);
      border: 1px dashed var(--admin-border);
      color: var(--color-text-muted);
      background: #fafafa;
    }

    .admin-badge {
      display: inline-flex;
      align-items: center;
      padding: 0.15rem 0.5rem;
      font-size: 0.75rem;
      font-weight: 600;
      border-radius: 999px;
      letter-spacing: 0.02em;
    }

    .admin-badge[data-tone='success'] {
      color: #2d6a1f;
      background: rgba(129, 215, 66, 0.22);
    }

    .admin-badge[data-tone='danger'] {
      color: #8b1e1e;
      background: rgba(221, 51, 51, 0.12);
    }

    .admin-badge[data-tone='neutral'] {
      color: #555;
      background: #eee;
    }

    .admin-badge[data-tone='info'] {
      color: #1a6a80;
      background: rgba(42, 196, 234, 0.18);
    }

    .admin-table__cell-inner {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      max-width: 100%;
    }

    .admin-table__cell-btn {
      display: inline-flex;
      align-items: center;
      margin: 0;
      padding: 0;
      border: 0;
      background: transparent;
      cursor: pointer;
      font: inherit;
      color: inherit;
      border-radius: var(--radius-md);
    }

    .admin-table__cell-btn:hover .admin-badge {
      filter: brightness(0.95);
    }

    .admin-table__cell-btn:focus-visible {
      outline: 2px solid var(--color-extra-1);
      outline-offset: 2px;
    }

    .admin-table__action-mini {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      width: 24px;
      height: 24px;
      margin: 0;
      padding: 0;
      border: 1px solid var(--admin-border);
      border-radius: var(--radius-md);
      background: #fafafa;
      color: var(--color-text-muted);
      cursor: pointer;
      transition: color 0.15s ease, background 0.15s ease, border-color 0.15s ease;
    }

    .admin-table__action-mini:hover {
      color: var(--color-accent);
      border-color: var(--color-accent);
      background: rgba(221, 51, 51, 0.06);
    }

    .admin-table__action-mini:focus-visible {
      outline: 2px solid var(--color-extra-1);
      outline-offset: 2px;
    }

    .admin-table__actions {
      white-space: nowrap;
      display: flex;
      gap: 0.15rem;
      align-items: center;
      justify-content: flex-end;
      min-width: 80px;
      width: 80px;
    }

    .admin-table__icon-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border: 0;
      background: transparent;
      color: var(--color-text);
      cursor: pointer;
      border-radius: var(--radius-md);
      transition: color 0.15s ease, background 0.15s ease;
    }

    .admin-table__icon-btn:hover {
      color: var(--color-accent);
      background: rgba(221, 51, 51, 0.08);
    }

    .admin-table__icon-btn--danger:hover {
      color: #b82b2b;
      background: rgba(221, 51, 51, 0.1);
    }

    .admin-table__icon-btn:focus-visible {
      outline: 2px solid var(--color-extra-1);
      outline-offset: 2px;
    }

    .admin-table__empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      padding: 2.5rem 1.25rem;
      color: var(--color-text-muted);
      text-align: center;
    }

    .admin-table__empty p {
      margin: 0;
    }

    .admin-skel {
      display: block;
      height: 12px;
      width: 70%;
      border-radius: var(--radius-sm);
      background: linear-gradient(90deg, #eee 25%, #f5f5f5 50%, #eee 75%);
      background-size: 200% 100%;
      animation: admin-shimmer 1.2s linear infinite;
    }

    .admin-skel--sm {
      width: 40%;
    }

    .admin-skel--check {
      width: 16px;
      height: 16px;
    }

    @keyframes admin-shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    .admin-table__pager {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
      padding: 0.625rem 0.875rem;
      border-top: 1px solid var(--admin-border);
      background: #fcfcfc;
    }

    .admin-table__meta {
      margin: 0;
      font-size: 0.8125rem;
      color: var(--color-text-muted);
    }

    .admin-table__pager-actions {
      display: flex;
      gap: 0.5rem;
    }

    @media (max-width: 720px) {
      .admin-table-wrap {
        overflow-x: auto;
      }
    }
  `,
})
export class AdminTable<T> {
  readonly columns = input.required<AdminTableColumn<T>[]>();
  readonly rows = input.required<T[]>();
  readonly loading = input(false);
  readonly emptyMessage = input('Sin resultados');
  readonly meta = input<PaginatedMeta | null>(null);
  readonly showActions = input(true);
  readonly showToggle = input(false);
  readonly isActive = input<(row: T) => boolean>(() => false);
  readonly trackBy = input<(row: T) => string | number>((row) =>
    String((row as { id?: string | number }).id ?? JSON.stringify(row)),
  );

  /** Si true, muestra checkboxes de selección masiva. */
  readonly selectable = input(false);
  /** IDs seleccionados (controlados por el padre). */
  readonly selectedIds = input<ReadonlySet<string | number>>(new Set());

  readonly edit = output<T>();
  readonly remove = output<T>();
  readonly toggle = output<T>();
  readonly pageChange = output<number>();
  readonly selectionChange = output<Set<string | number>>();
  readonly cellClick = output<AdminTableCellEvent<T>>();
  readonly cellAction = output<AdminTableCellEvent<T>>();

  protected readonly skeletonRows = [1, 2, 3, 4, 5];

  protected readonly pageIds = computed(() =>
    this.rows().map((row) => this.trackBy()(row)),
  );

  protected readonly allPageSelected = computed(() => {
    const ids = this.pageIds();
    if (ids.length === 0) return false;
    const selected = this.selectedIds();
    return ids.every((id) => selected.has(id));
  });

  protected readonly somePageSelected = computed(() => {
    const selected = this.selectedIds();
    return this.pageIds().some((id) => selected.has(id));
  });

  protected isSelected(row: T): boolean {
    return this.selectedIds().has(this.trackBy()(row));
  }

  protected toggleRow(row: T, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const id = this.trackBy()(row);
    const next = new Set(this.selectedIds());
    if (checked) {
      next.add(id);
    } else {
      next.delete(id);
    }
    this.selectionChange.emit(next);
  }

  protected toggleSelectAll(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const next = new Set(this.selectedIds());
    for (const id of this.pageIds()) {
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
    }
    this.selectionChange.emit(next);
  }
}
