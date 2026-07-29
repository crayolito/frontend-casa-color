import {
  ChangeDetectionStrategy,
  Component,
  isDevMode,
  OnInit,
  inject,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { Location } from '@angular/common';

/**
 * Página 404 pública.
 * Tracking mínimo: console.warn en producción (opt-in a backend/Sentry después).
 */
@Component({
  selector: 'app-not-found',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink],
  templateUrl: './not-found.html',
  styleUrl: './not-found.css',
})
export class NotFound implements OnInit {
  private readonly location = inject(Location);

  protected readonly path = this.location.path() || '/';

  ngOnInit(): void {
    if (!isDevMode()) {
      // Opt-in futuro: POST a endpoint de analytics / Sentry captureMessage.
      console.warn('[404]', this.path, document.referrer || '(direct)');
    }
  }
}
