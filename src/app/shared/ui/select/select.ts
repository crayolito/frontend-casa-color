import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  HostListener,
  forwardRef,
  inject,
  input,
  output,
  signal,
  computed,
  viewChild,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

/** ~3 filas visibles; el resto hace scroll. */
const LIST_MAX_HEIGHT = '8.25rem';
const SEARCH_THRESHOLD = 4;

@Component({
  selector: 'app-select',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AppSelect),
      multi: true,
    },
  ],
  template: `
    <div
      class="app-select"
      [class.app-select--open]="open()"
      [class.app-select--disabled]="isDisabled()"
      [class.app-select--inline]="expandInline()"
    >
      <button
        #trigger
        type="button"
        class="app-select__trigger"
        [id]="id() || null"
        [disabled]="isDisabled()"
        [attr.aria-label]="ariaLabel() || null"
        [attr.aria-expanded]="open()"
        [attr.aria-haspopup]="'listbox'"
        [attr.aria-controls]="listboxId"
        (click)="toggle()"
        (keydown)="onTriggerKeydown($event)"
      >
        <span
          class="app-select__value"
          [class.app-select__value--placeholder]="!selectedLabel()"
        >
          {{ selectedLabel() || placeholder() }}
        </span>
        <svg
          class="app-select__chevron"
          width="12"
          height="8"
          viewBox="0 0 12 8"
          aria-hidden="true"
        >
          <path fill="currentColor" d="M1.41.59 6 5.17 10.59.59 12 2 6 8 0 2z" />
        </svg>
      </button>

      @if (open()) {
        <div class="app-select__dropdown" role="presentation">
          @if (showSearch()) {
            <div class="app-select__search">
              <input
                #searchInput
                type="search"
                class="app-select__search-input"
                [value]="searchQuery()"
                placeholder="Buscar…"
                autocomplete="off"
                [attr.aria-label]="'Buscar en opciones'"
                (input)="onSearchInput($event)"
                (keydown)="onListKeydown($event)"
                (click)="$event.stopPropagation()"
              />
            </div>
          }
          <ul
            class="app-select__list"
            role="listbox"
            [id]="listboxId"
            [attr.aria-activedescendant]="activeOptionId()"
            (keydown)="onListKeydown($event)"
          >
            @for (opt of filteredOptions(); track opt.value; let i = $index) {
              <li
                role="option"
                class="app-select__option"
                [id]="optionId(i)"
                [class.app-select__option--selected]="isSelected(opt)"
                [class.app-select__option--active]="activeIndex() === i"
                [class.app-select__option--disabled]="opt.disabled"
                [attr.aria-selected]="isSelected(opt)"
                [attr.aria-disabled]="opt.disabled || null"
                (click)="selectOption(opt)"
                (mouseenter)="activeIndex.set(i)"
              >
                {{ opt.label }}
              </li>
            } @empty {
              <li class="app-select__empty" role="presentation">Sin opciones</li>
            }
          </ul>
        </div>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      position: relative;
    }

    .app-select {
      position: relative;
      width: 100%;
    }

    .app-select__trigger {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.5rem;
      width: 100%;
      min-height: var(--admin-input-h, 40px);
      padding: 0.4rem 0.75rem;
      border: 1px solid var(--admin-border, #d9d9d9);
      border-radius: var(--radius-md, 6px);
      background: var(--color-white, #fff);
      font-family: var(--font-body, inherit);
      font-size: 0.9375rem;
      color: #333;
      cursor: pointer;
      text-align: left;
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }

    .app-select__trigger:hover:not(:disabled) {
      border-color: #bbb;
    }

    .app-select__trigger:focus-visible {
      outline: none;
      border-color: var(--color-accent, #dd3333);
      box-shadow: 0 0 0 3px rgba(221, 51, 51, 0.12);
    }

    .app-select--open .app-select__trigger {
      border-color: var(--color-accent, #dd3333);
      box-shadow: 0 0 0 3px rgba(221, 51, 51, 0.12);
    }

    .app-select--disabled .app-select__trigger {
      opacity: 0.6;
      cursor: not-allowed;
      background: #f5f5f5;
    }

    .app-select__value {
      flex: 1;
      min-width: 0;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .app-select__value--placeholder {
      color: var(--color-text-muted, #888);
    }

    .app-select__chevron {
      flex-shrink: 0;
      color: #555;
      transition: transform 0.2s ease;
    }

    .app-select--open .app-select__chevron {
      transform: rotate(180deg);
    }

    .app-select__dropdown {
      position: absolute;
      z-index: 50;
      top: calc(100% + 4px);
      left: 0;
      right: 0;
      background: var(--color-white, #fff);
      border: 1px solid var(--admin-border, #d9d9d9);
      border-radius: var(--radius-md, 6px);
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
      overflow: hidden;
    }

    /* Dentro de modals: crece en el flujo, no flota encima del panel. */
    .app-select--inline .app-select__dropdown {
      position: static;
      margin-top: 0.35rem;
      z-index: auto;
      box-shadow: none;
    }

    .app-select__search {
      padding: 0.35rem 0.35rem 0;
    }

    .app-select__search-input {
      width: 100%;
      min-height: 2.25rem;
      padding: 0.35rem 0.75rem;
      border: 1px solid var(--admin-border, #d9d9d9);
      border-radius: 4px;
      font-family: var(--font-body, inherit);
      font-size: 0.875rem;
      color: #333;
      background: #fafafa;
    }

    .app-select__search-input:focus {
      outline: none;
      border-color: var(--color-accent, #dd3333);
      box-shadow: 0 0 0 2px rgba(221, 51, 51, 0.12);
      background: var(--color-white, #fff);
    }

    .app-select__list {
      margin: 0;
      padding: 0.35rem;
      list-style: none;
      max-height: ${LIST_MAX_HEIGHT};
      overflow-y: auto;
    }

    .app-select__option {
      padding: 0.55rem 0.75rem;
      border-radius: 4px;
      font-size: 0.9375rem;
      color: #333;
      cursor: pointer;
      line-height: 1.35;
    }

    .app-select__option--active {
      background: #f5f5f5;
    }

    .app-select__option--selected {
      background: rgba(221, 51, 51, 0.08);
      color: var(--color-accent, #dd3333);
      font-weight: 600;
    }

    .app-select__option--selected.app-select__option--active {
      background: rgba(221, 51, 51, 0.14);
    }

    .app-select__option--disabled {
      opacity: 0.45;
      cursor: not-allowed;
    }

    .app-select__empty {
      padding: 0.75rem;
      font-size: 0.875rem;
      color: var(--color-text-muted, #888);
      text-align: center;
    }
  `,
})
export class AppSelect implements ControlValueAccessor {
  private readonly hostEl = inject(ElementRef<HTMLElement>);

  readonly options = input<SelectOption[]>([]);
  readonly value = input<string | number | null>(null);
  readonly placeholder = input('Seleccioná…');
  readonly disabled = input(false);
  readonly id = input<string | undefined>(undefined);
  readonly ariaLabel = input<string | undefined>(undefined);
  /** Forzá búsqueda aunque haya pocas opciones. */
  readonly searchable = input(false);
  /** Despliega search+lista en el flujo (modals) en vez de overlay absoluto. */
  readonly expandInline = input(false);

  readonly valueChange = output<string | number | null>();

  readonly open = signal(false);
  readonly activeIndex = signal(0);
  readonly searchQuery = signal('');
  private readonly internalValue = signal<string | number | null>(null);
  private readonly cvaDisabled = signal(false);

  private readonly triggerRef =
    viewChild<ElementRef<HTMLButtonElement>>('trigger');
  private readonly searchInputRef =
    viewChild<ElementRef<HTMLInputElement>>('searchInput');

  readonly listboxId = `app-select-list-${Math.random().toString(36).slice(2, 9)}`;

  readonly isDisabled = computed(() => this.disabled() || this.cvaDisabled());

  readonly showSearch = computed(
    () => this.searchable() || this.options().length >= SEARCH_THRESHOLD,
  );

  readonly filteredOptions = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const opts = this.options();
    if (!q) return opts;
    return opts.filter((o) => o.label.toLowerCase().includes(q));
  });

  readonly currentValue = computed(() => {
    const fromInput = this.value();
    if (fromInput !== null && fromInput !== undefined) return fromInput;
    return this.internalValue();
  });

  readonly selectedLabel = computed(() => {
    const v = this.currentValue();
    if (v === null || v === undefined || v === '') return null;
    return (
      this.options().find((o) => String(o.value) === String(v))?.label ?? null
    );
  });

  readonly activeOptionId = computed(() => {
    if (!this.open()) return null;
    return this.optionId(this.activeIndex());
  });

  private onChange: (v: string | number | null) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(value: string | number | null): void {
    this.internalValue.set(value ?? null);
  }

  registerOnChange(fn: (v: string | number | null) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.cvaDisabled.set(isDisabled);
  }

  optionId(index: number): string {
    return `${this.listboxId}-opt-${index}`;
  }

  isSelected(opt: SelectOption): boolean {
    const v = this.currentValue();
    if (v === null || v === undefined) return false;
    return String(opt.value) === String(v);
  }

  toggle(): void {
    if (this.isDisabled()) return;
    if (this.open()) {
      this.close();
    } else {
      this.openList();
    }
  }

  openList(): void {
    if (this.isDisabled()) return;
    this.searchQuery.set('');
    const opts = this.options();
    const current = this.currentValue();
    const idx = opts.findIndex((o) => String(o.value) === String(current));
    this.activeIndex.set(idx >= 0 ? idx : 0);
    this.open.set(true);
    queueMicrotask(() => this.searchInputRef()?.nativeElement.focus());
  }

  close(): void {
    this.open.set(false);
    this.searchQuery.set('');
    this.onTouched();
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchQuery.set(value);
    this.activeIndex.set(0);
  }

  selectOption(opt: SelectOption): void {
    if (opt.disabled) return;
    this.internalValue.set(opt.value);
    this.onChange(opt.value);
    this.valueChange.emit(opt.value);
    this.close();
    this.triggerRef()?.nativeElement.focus();
  }

  onTriggerKeydown(event: KeyboardEvent): void {
    if (this.isDisabled()) return;
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp':
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (!this.open()) this.openList();
        break;
      case 'Escape':
        if (this.open()) {
          event.preventDefault();
          this.close();
        }
        break;
    }
  }

  onListKeydown(event: KeyboardEvent): void {
    const opts = this.filteredOptions();
    if (!opts.length && event.key !== 'Escape') return;
    switch (event.key) {
      case 'ArrowDown': {
        event.preventDefault();
        let next = this.activeIndex() + 1;
        while (next < opts.length && opts[next].disabled) next++;
        if (next < opts.length) this.activeIndex.set(next);
        break;
      }
      case 'ArrowUp': {
        event.preventDefault();
        let prev = this.activeIndex() - 1;
        while (prev >= 0 && opts[prev].disabled) prev--;
        if (prev >= 0) this.activeIndex.set(prev);
        break;
      }
      case 'Enter': {
        event.preventDefault();
        const opt = opts[this.activeIndex()];
        if (opt) this.selectOption(opt);
        break;
      }
      case ' ': {
        // En el input de búsqueda, espacio escribe; en la lista, selecciona.
        if ((event.target as HTMLElement)?.tagName === 'INPUT') return;
        event.preventDefault();
        const opt = opts[this.activeIndex()];
        if (opt) this.selectOption(opt);
        break;
      }
      case 'Escape':
        event.preventDefault();
        this.close();
        this.triggerRef()?.nativeElement.focus();
        break;
      case 'Tab':
        this.close();
        break;
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (!this.open()) return;
    const target = event.target as Node;
    if (!this.hostEl.nativeElement.contains(target)) {
      this.close();
    }
  }
}
