import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
} from '@angular/core';

export interface AdminTab {
  id: string;
  label: string;
}

@Component({
  selector: 'app-admin-tabs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-tabs">
      <div class="admin-tabs__list" role="tablist">
        @for (tab of tabs(); track tab.id) {
          <button
            type="button"
            class="admin-tabs__tab"
            role="tab"
            [class.admin-tabs__tab--active]="active() === tab.id"
            [attr.aria-selected]="active() === tab.id"
            [id]="'tab-' + tab.id"
            (click)="select(tab.id)"
          >
            {{ tab.label }}
          </button>
        }
      </div>
      <div
        class="admin-tabs__panel"
        role="tabpanel"
        [attr.aria-labelledby]="'tab-' + active()"
      >
        <ng-content />
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .admin-tabs__list {
      display: flex;
      gap: 0.25rem;
      border-bottom: 1px solid var(--admin-border);
      margin-bottom: var(--admin-gap, 0.75rem);
      overflow-x: auto;
    }

    .admin-tabs__tab {
      position: relative;
      padding: 0.625rem 1rem;
      border: 0;
      background: transparent;
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--color-text-muted);
      cursor: pointer;
      white-space: nowrap;
      border-bottom: 2px solid transparent;
      margin-bottom: -1px;
      transition: color 0.15s ease, border-color 0.15s ease;
    }

    .admin-tabs__tab:hover {
      color: var(--color-text);
    }

    .admin-tabs__tab--active {
      color: var(--color-accent);
      border-bottom-color: var(--color-accent);
    }

    .admin-tabs__tab:focus-visible {
      outline: 2px solid var(--color-extra-1);
      outline-offset: 2px;
    }
  `,
})
export class AdminTabs {
  readonly tabs = input.required<AdminTab[]>();
  readonly active = input.required<string>();
  readonly activeChange = output<string>();

  select(id: string): void {
    this.activeChange.emit(id);
  }
}
