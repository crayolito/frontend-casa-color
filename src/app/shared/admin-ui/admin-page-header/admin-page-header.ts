import { Component, ChangeDetectionStrategy, input } from '@angular/core';

@Component({
  selector: 'app-admin-page-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="admin-page-header">
      <div class="admin-page-header__text">
        @if (breadcrumb(); as crumb) {
          <p class="admin-page-header__crumb">{{ crumb }}</p>
        }
        <h1 class="admin-page-header__title">{{ title() }}</h1>
        @if (subtitle(); as sub) {
          <p class="admin-page-header__subtitle">{{ sub }}</p>
        }
      </div>
      <div class="admin-page-header__actions">
        <ng-content />
      </div>
    </header>
  `,
  styles: `
    :host {
      display: block;
      margin-bottom: 1.5rem;
    }

    .admin-page-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .admin-page-header__crumb {
      margin: 0 0 0.25rem;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--color-text-muted);
    }

    .admin-page-header__title {
      margin: 0;
      font-size: 1.75rem;
      line-height: 1.2;
      font-weight: 300;
      color: #333;
    }

    .admin-page-header__subtitle {
      margin: 0.35rem 0 0;
      color: var(--color-text-muted);
      font-size: 0.9375rem;
    }

    .admin-page-header__actions {
      display: flex;
      gap: 0.75rem;
      flex-wrap: wrap;
    }
  `,
})
export class AdminPageHeader {
  readonly title = input.required<string>();
  readonly subtitle = input<string | null>(null);
  readonly breadcrumb = input<string | null>(null);
}
