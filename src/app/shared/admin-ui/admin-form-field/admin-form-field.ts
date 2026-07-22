import {
  Component,
  ChangeDetectionStrategy,
  input,
  inject,
} from '@angular/core';
import { ControlContainer, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-admin-form-field',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule],
  viewProviders: [
    {
      provide: ControlContainer,
      useFactory: () => inject(ControlContainer, { skipSelf: true }),
    },
  ],
  template: `
    <div class="admin-field">
      <label class="admin-field__label" [attr.for]="controlName()">{{ label() }}</label>
      @if (type() === 'textarea') {
        <textarea
          class="admin-field__control"
          [id]="controlName()"
          [formControlName]="controlName()"
          [attr.rows]="rows()"
          [attr.autocomplete]="autocomplete() ?? null"
        ></textarea>
      } @else if (type() === 'select') {
        <select
          class="admin-field__control"
          [id]="controlName()"
          [formControlName]="controlName()"
        >
          <ng-content />
        </select>
      } @else {
        <input
          class="admin-field__control"
          [id]="controlName()"
          [type]="type()"
          [formControlName]="controlName()"
          [attr.autocomplete]="autocomplete() ?? null"
        />
      }
      @if (error(); as err) {
        <p class="admin-field__error" role="alert">{{ err }}</p>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .admin-field {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }

    .admin-field__label {
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--color-text);
    }

    .admin-field__control {
      width: 100%;
      min-height: 44px;
      padding: 0.625rem 0.875rem;
      border: 1px solid rgba(0, 0, 0, 0.15);
      border-radius: var(--radius);
      font-family: var(--font-body);
      font-size: 1rem;
      color: #333;
      background: var(--color-white);
    }

    textarea.admin-field__control {
      min-height: 96px;
      resize: vertical;
    }

    .admin-field__control:focus {
      outline: 2px solid var(--color-extra-1);
      outline-offset: 1px;
      border-color: var(--color-accent);
    }

    .admin-field__error {
      margin: 0;
      font-size: 0.8125rem;
      color: var(--color-accent);
      font-weight: 600;
    }
  `,
})
export class AdminFormField {
  readonly label = input.required<string>();
  readonly controlName = input.required<string>();
  readonly type = input<'text' | 'email' | 'password' | 'number' | 'url' | 'textarea' | 'select'>(
    'text',
  );
  readonly error = input<string | null>(null);
  readonly autocomplete = input<string | undefined>(undefined);
  readonly rows = input(4);
}
