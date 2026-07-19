import { Component, input } from '@angular/core';

export type ButtonVariant = 'primary' | 'accent' | 'ghost';

@Component({
  selector: 'app-button',
  template: `
    @if (href()) {
      <a class="btn" [class]="variantClass()" [href]="href()" [attr.target]="target()" [attr.rel]="rel()">
        <ng-content />
      </a>
    } @else {
      <button class="btn" [class]="variantClass()" [type]="type()" [disabled]="disabled()">
        <ng-content />
      </button>
    }
  `,
  styles: `
    :host {
      display: inline-block;
    }

    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      min-height: 44px;
      padding: 0.75rem 1.75rem;
      border: 2px solid transparent;
      border-radius: var(--radius);
      font-family: var(--font-body);
      font-size: 0.875rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      text-decoration: none;
      cursor: pointer;
      transition: background-color 0.45s cubic-bezier(0.25, 1, 0.33, 1),
        color 0.45s cubic-bezier(0.25, 1, 0.33, 1),
        border-color 0.45s cubic-bezier(0.25, 1, 0.33, 1);
    }

    .btn:focus-visible {
      outline: 2px solid var(--color-extra-1);
      outline-offset: 2px;
    }

    .btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .btn--primary {
      background: var(--color-accent);
      color: var(--color-white);
      border-color: var(--color-accent);
    }

    .btn--primary:hover:not(:disabled) {
      background: #b82b2b;
      border-color: #b82b2b;
      text-decoration: none;
    }

    .btn--accent {
      background: var(--color-white);
      color: var(--color-accent);
      border-color: var(--color-white);
    }

    .btn--accent:hover:not(:disabled) {
      background: transparent;
      color: var(--color-white);
      text-decoration: none;
    }

    .btn--ghost {
      background: transparent;
      color: var(--color-white);
      border-color: var(--color-white);
    }

    .btn--ghost:hover:not(:disabled) {
      background: var(--color-white);
      color: var(--color-accent);
      text-decoration: none;
    }
  `,
})
export class Button {
  readonly variant = input<ButtonVariant>('primary');
  readonly href = input<string | undefined>(undefined);
  readonly type = input<'button' | 'submit' | 'reset'>('button');
  readonly disabled = input(false);
  readonly target = input<string | undefined>(undefined);
  readonly rel = input<string | undefined>(undefined);

  protected variantClass(): string {
    return `btn--${this.variant()}`;
  }
}
