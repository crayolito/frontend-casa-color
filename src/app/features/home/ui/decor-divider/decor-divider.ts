import { Component, computed, input } from '@angular/core';
import { withProductFallback } from '../../../../shared/util/default-images';

@Component({
  selector: 'app-decor-divider',
  templateUrl: './decor-divider.html',
  styleUrl: './decor-divider.css',
})
export class DecorDivider {
  /** URL desde admin (find-product.decorImageUrl). Vacío → auxiliar. */
  readonly imageUrl = input<string | undefined | null>(undefined);

  protected readonly src = computed(() => withProductFallback(this.imageUrl()));
}
