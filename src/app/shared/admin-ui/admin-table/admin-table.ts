import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { PaginatedMeta } from '../../../core/http/api.service';
import { AdminButton } from '../admin-button/admin-button';
import { AdminIcon } from '../icons/admin-icon';

export interface AdminTableColumn<T> {
  key: string;
  label: string;
  cell: (row: T) => string;
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
              <tr>
                @for (col of columns(); track col.key) {
                  <td>{{ col.cell(row) }}</td>
                }
                @if (showActions()) {
                  <td class="admin-table__actions">
                    <button
                      type="button"
                      class="admin-table__icon-btn"
                      aria-label="Editar"
                      (click)="edit.emit(row)"
                    >
                      <app-admin-icon name="edit" />
                    </button>
                    <button
                      type="button"
                      class="admin-table__icon-btn admin-table__icon-btn--danger"
                      aria-label="Eliminar"
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
      box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05), 0 4px 20px rgba(0, 0, 0, 0.04);
      overflow-x: auto;
    }

    .admin-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 0.9375rem;
    }

    .admin-table--refreshing {
      opacity: 0.72;
    }

    .admin-table th,
    .admin-table td {
      padding: 0.875rem 1rem;
      text-align: left;
      border-bottom: 1px solid rgba(0, 0, 0, 0.06);
      vertical-align: middle;
    }

    .admin-table th {
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--color-text-muted);
      background: #fafafa;
    }

    .admin-table__actions {
      white-space: nowrap;
      display: flex;
      gap: 0.25rem;
    }

    .admin-table__icon-btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      border: 0;
      background: transparent;
      color: var(--color-text);
      cursor: pointer;
      border-radius: var(--radius);
    }

    .admin-table__icon-btn:hover {
      color: var(--color-accent);
      background: rgba(221, 51, 51, 0.06);
    }

    .admin-table__icon-btn--danger:hover {
      color: #b82b2b;
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
      height: 14px;
      width: 70%;
      background: linear-gradient(90deg, #eee 25%, #f5f5f5 50%, #eee 75%);
      background-size: 200% 100%;
      animation: admin-shimmer 1.2s linear infinite;
    }

    .admin-skel--sm {
      width: 40%;
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
      padding: 0.875rem 1rem;
      border-top: 1px solid rgba(0, 0, 0, 0.06);
    }

    .admin-table__meta {
      margin: 0;
      font-size: 0.875rem;
      color: var(--color-text-muted);
    }

    .admin-table__pager-actions {
      display: flex;
      gap: 0.5rem;
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
  readonly trackBy = input<(row: T) => string | number>((row) =>
    String((row as { id?: string | number }).id ?? JSON.stringify(row)),
  );

  readonly edit = output<T>();
  readonly remove = output<T>();
  readonly pageChange = output<number>();

  protected readonly skeletonRows = [1, 2, 3, 4, 5];
}
