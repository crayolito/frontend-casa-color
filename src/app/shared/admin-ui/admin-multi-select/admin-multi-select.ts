import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
  computed,
} from '@angular/core';
import { AdminIcon } from '../icons/admin-icon';

export interface AdminMultiSelectOption {
  id: number;
  label: string;
}

@Component({
  selector: 'app-admin-multi-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AdminIcon],
  template: `
    <div class="admin-ms">
      <label class="admin-ms__label">{{ label() }}</label>
      @if (selected().length > 0) {
        <div class="admin-ms__chips" role="list">
          @for (opt of selected(); track opt.id) {
            <span class="admin-ms__chip" role="listitem">
              {{ opt.label }}
              <button
                type="button"
                class="admin-ms__chip-remove"
                [attr.aria-label]="'Quitar ' + opt.label"
                (click)="remove(opt.id)"
              >
                <app-admin-icon name="x" [size]="12" />
              </button>
            </span>
          }
        </div>
      }
      <select
        class="admin-ms__select"
        [value]="''"
        (change)="onAdd($event)"
        [attr.aria-label]="label()"
      >
        <option value="" disabled selected>{{ placeholder() }}</option>
        @for (opt of available(); track opt.id) {
          <option [value]="opt.id">{{ opt.label }}</option>
        }
      </select>
      @if (hint(); as h) {
        <p class="admin-ms__hint">{{ h }}</p>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .admin-ms {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }

    .admin-ms__label {
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--color-text);
    }

    .admin-ms__chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.375rem;
    }

    .admin-ms__chip {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      padding: 0.2rem 0.5rem;
      font-size: 0.8125rem;
      font-weight: 600;
      color: #333;
      background: #f5f5f5;
      border: 1px solid var(--admin-border);
      border-radius: 999px;
    }

    .admin-ms__chip-remove {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 18px;
      height: 18px;
      border: 0;
      background: transparent;
      color: var(--color-text-muted);
      cursor: pointer;
      border-radius: 50%;
      padding: 0;
    }

    .admin-ms__chip-remove:hover {
      color: var(--color-accent);
      background: rgba(221, 51, 51, 0.08);
    }

    .admin-ms__select {
      width: 100%;
      min-height: var(--admin-input-h, 38px);
      padding: 0.4rem 0.75rem;
      border: 1px solid var(--admin-border);
      border-radius: var(--radius-md);
      font-family: var(--font-body);
      font-size: 0.9375rem;
      color: #333;
      background: var(--color-white);
    }

    .admin-ms__select:focus {
      outline: none;
      border-color: var(--color-accent);
      box-shadow: 0 0 0 3px rgba(221, 51, 51, 0.12);
    }

    .admin-ms__hint {
      margin: 0;
      font-size: 0.75rem;
      color: var(--color-text-muted);
    }
  `,
})
export class AdminMultiSelect {
  readonly label = input.required<string>();
  readonly options = input.required<AdminMultiSelectOption[]>();
  readonly value = input<number[]>([]);
  readonly excludeIds = input<number[]>([]);
  readonly placeholder = input('Agregar…');
  readonly hint = input<string | null>(null);

  readonly valueChange = output<number[]>();

  readonly selected = computed(() => {
    const ids = new Set(this.value());
    return this.options().filter((o) => ids.has(o.id));
  });

  readonly available = computed(() => {
    const taken = new Set([...this.value(), ...this.excludeIds()]);
    return this.options().filter((o) => !taken.has(o.id));
  });

  onAdd(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const id = Number(select.value);
    if (!id) return;
    if (this.value().includes(id)) return;
    this.valueChange.emit([...this.value(), id]);
    select.value = '';
  }

  remove(id: number): void {
    this.valueChange.emit(this.value().filter((x) => x !== id));
  }
}
