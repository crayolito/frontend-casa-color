import { Component, ChangeDetectionStrategy, input } from '@angular/core';

export type AdminIconName =
  | 'search'
  | 'plus'
  | 'edit'
  | 'trash'
  | 'logout'
  | 'categories'
  | 'catalogs'
  | 'products'
  | 'settings'
  | 'image'
  | 'x'
  | 'lock'
  | 'upload'
  | 'star';

@Component({
  selector: 'app-admin-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      @switch (name()) {
        @case ('search') {
          <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.5" />
          <path d="M20 20l-3.5-3.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        }
        @case ('plus') {
          <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        }
        @case ('edit') {
          <path d="M4 20h4l10-10-4-4L4 16v4z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
          <path d="M13 7l4 4" stroke="currentColor" stroke-width="1.5" />
        }
        @case ('trash') {
          <path d="M4 7h16M9 7V5h6v2M8 7l1 12h6l1-12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        }
        @case ('logout') {
          <path d="M10 7V5a2 2 0 012-2h6a2 2 0 012 2v14a2 2 0 01-2 2h-6a2 2 0 01-2-2v-2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          <path d="M15 12H4m0 0l3-3m-3 3l3 3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        }
        @case ('categories') {
          <path d="M4 6h16M4 12h16M4 18h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        }
        @case ('catalogs') {
          <rect x="4" y="4" width="7" height="7" stroke="currentColor" stroke-width="1.5" />
          <rect x="13" y="4" width="7" height="7" stroke="currentColor" stroke-width="1.5" />
          <rect x="4" y="13" width="7" height="7" stroke="currentColor" stroke-width="1.5" />
          <rect x="13" y="13" width="7" height="7" stroke="currentColor" stroke-width="1.5" />
        }
        @case ('products') {
          <path d="M4 8l8-4 8 4v8l-8 4-8-4V8z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
          <path d="M12 12v8M4 8l8 4 8-4" stroke="currentColor" stroke-width="1.5" />
        }
        @case ('settings') {
          <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="1.5" />
          <path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        }
        @case ('image') {
          <rect x="3" y="5" width="18" height="14" rx="0" stroke="currentColor" stroke-width="1.5" />
          <circle cx="9" cy="10" r="1.5" stroke="currentColor" stroke-width="1.5" />
          <path d="M3 16l5-4 4 3 3-2 6 3" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
        }
        @case ('x') {
          <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        }
        @case ('lock') {
          <rect x="5" y="11" width="14" height="10" stroke="currentColor" stroke-width="1.5" />
          <path d="M8 11V8a4 4 0 018 0v3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        }
        @case ('upload') {
          <path d="M12 16V5m0 0l-4 4m4-4l4 4M4 19h16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
        }
        @case ('star') {
          <path d="M12 3l2.5 6.5H21l-5 4 2 6.5L12 16l-6 4 2-6.5-5-4h6.5L12 3z" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round" />
        }
      }
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      line-height: 0;
      color: inherit;
    }
  `,
})
export class AdminIcon {
  readonly name = input.required<AdminIconName>();
  readonly size = input(18);
}
