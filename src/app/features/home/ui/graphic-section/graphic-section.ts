import { Component, computed, input } from '@angular/core';

const DEFAULT_GRAPHIC = '/img/decor/red-paint.png';

@Component({
  selector: 'app-graphic-section',
  templateUrl: './graphic-section.html',
  styleUrl: './graphic-section.css',
})
export class GraphicSection {
  /** URL desde home.footer.topImageUrl. Vacío → red-paint. */
  readonly imageUrl = input<string | null | undefined>(undefined);

  protected readonly src = computed(() => {
    const url = this.imageUrl()?.trim();
    return url || DEFAULT_GRAPHIC;
  });
}
