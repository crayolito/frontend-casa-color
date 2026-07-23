import {
  Component,
  ChangeDetectionStrategy,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-admin-switch',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => AdminSwitch),
      multi: true,
    },
  ],
  template: `
    <label class="admin-switch" [class.admin-switch--on]="checked()">
      <input
        class="admin-switch__input"
        type="checkbox"
        role="switch"
        [checked]="checked()"
        [disabled]="disabled()"
        [attr.aria-checked]="checked()"
        [attr.aria-label]="label()"
        (change)="onToggle($event)"
      />
      <span class="admin-switch__track" aria-hidden="true">
        <span class="admin-switch__thumb"></span>
      </span>
      <span class="admin-switch__text">
        {{ checked() ? activeLabel() : inactiveLabel() }}
      </span>
    </label>
  `,
  styles: `
    :host {
      display: inline-flex;
    }

    .admin-switch {
      display: inline-flex;
      align-items: center;
      gap: 0.625rem;
      cursor: pointer;
      user-select: none;
    }

    .admin-switch__input {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
    }

    .admin-switch__track {
      position: relative;
      width: 40px;
      height: 22px;
      border-radius: 999px;
      background: #d0d0d0;
      transition: background 0.15s ease;
      flex-shrink: 0;
    }

    .admin-switch--on .admin-switch__track {
      background: var(--color-extra-3, #81d742);
    }

    .admin-switch__thumb {
      position: absolute;
      top: 2px;
      left: 2px;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: var(--color-white);
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
      transition: transform 0.15s ease;
    }

    .admin-switch--on .admin-switch__thumb {
      transform: translateX(18px);
    }

    .admin-switch__text {
      font-size: 0.875rem;
      font-weight: 600;
      color: var(--color-text);
    }

    .admin-switch__input:focus-visible + .admin-switch__track {
      outline: 2px solid var(--color-extra-1);
      outline-offset: 2px;
    }

    .admin-switch:has(.admin-switch__input:disabled) {
      opacity: 0.55;
      cursor: not-allowed;
    }
  `,
})
export class AdminSwitch implements ControlValueAccessor {
  readonly label = input('Estado');
  readonly activeLabel = input('Activo');
  readonly inactiveLabel = input('Inactivo');

  readonly checked = signal(false);
  readonly disabled = signal(false);

  private onChange: (value: boolean) => void = () => undefined;
  private onTouched: () => void = () => undefined;

  writeValue(value: boolean | null): void {
    this.checked.set(!!value);
  }

  registerOnChange(fn: (value: boolean) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled.set(isDisabled);
  }

  onToggle(event: Event): void {
    const next = (event.target as HTMLInputElement).checked;
    this.checked.set(next);
    this.onChange(next);
    this.onTouched();
  }
}
