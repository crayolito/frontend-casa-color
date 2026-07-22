import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/auth/auth.service';
import { isAppError } from '../../../shared/util/api-errors';
import { AdminButton } from '../../../shared/admin-ui/admin-button/admin-button';
import { AdminFormField } from '../../../shared/admin-ui/admin-form-field/admin-form-field';
import { AdminIcon } from '../../../shared/admin-ui/icons/admin-icon';

@Component({
  selector: 'app-admin-login',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ReactiveFormsModule, AdminButton, AdminFormField, AdminIcon],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class AdminLogin {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly fb = inject(FormBuilder);

  readonly submitting = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(12)]],
  });

  onSubmit(): void {
    this.errorMessage.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.getRawValue();
    this.submitting.set(true);

    this.auth.login(email, password).subscribe({
      next: () => {
        this.submitting.set(false);
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        const target =
          returnUrl && returnUrl.startsWith('/admin') && !returnUrl.startsWith('//')
            ? returnUrl
            : '/admin/products';
        void this.router.navigateByUrl(target);
      },
      error: (err: unknown) => {
        this.submitting.set(false);
        if (isAppError(err)) {
          this.errorMessage.set(
            err.code === 'INVALID_CREDENTIALS' || err.status === 401
              ? 'Credenciales inválidas'
              : err.message,
          );
          return;
        }
        this.errorMessage.set('No se pudo iniciar sesión');
      },
    });
  }
}
