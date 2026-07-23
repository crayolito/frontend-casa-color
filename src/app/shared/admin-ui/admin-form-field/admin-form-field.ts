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
      min-height: var(--admin-input-h, 38px);
      padding: 0.4rem 0.75rem;
      border: 1px solid var(--admin-border);
      border-radius: var(--radius-md);
      font-family: var(--font-body);
      font-size: 0.9375rem;
      color: #333;
      background: var(--color-white);
      transition: border-color 0.15s ease, box-shadow 0.15s ease;
    }

    textarea.admin-field__control {
      min-height: 80px;
      resize: vertical;
    }

    .admin-field__control:focus {
      outline: none;
      border-color: var(--color-accent);
      box-shadow: 0 0 0 3px rgba(221, 51, 51, 0.12);
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
