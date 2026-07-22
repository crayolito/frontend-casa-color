import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { AuthService } from '../../../../core/auth/auth.service';
import { AdminButton } from '../../../../shared/admin-ui/admin-button/admin-button';
import { AdminIcon } from '../../../../shared/admin-ui/icons/admin-icon';

@Component({
  selector: 'app-admin-topbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AdminButton, AdminIcon],
  templateUrl: './admin-topbar.html',
  styleUrl: './admin-topbar.css',
})
export class AdminTopbar {
  private readonly auth = inject(AuthService);

  readonly email = this.auth.email;

  logout(): void {
    this.auth.logout();
  }
}
