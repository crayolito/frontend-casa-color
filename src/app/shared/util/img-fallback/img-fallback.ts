import { Directive, HostListener, input } from '@angular/core';
import { DEFAULT_IMAGES } from '../default-images';

export type ImgFallbackKind = 'product' | 'category' | 'catalog' | 'logo';

const FALLBACK_BY_KIND: Record<ImgFallbackKind, string> = {
  product: DEFAULT_IMAGES.product,
  category: DEFAULT_IMAGES.category,
  catalog: DEFAULT_IMAGES.catalog,
  logo: DEFAULT_IMAGES.logo,
};

/**
 * Swap a DEFAULT_IMAGES path when the image fails to load (404 / corrupt).
 * One-shot: avoids infinite loop if the fallback itself fails.
 */
@Directive({
  selector: 'img[appImgFallback]',
  standalone: true,
})
export class ImgFallback {
  readonly appImgFallback = input.required<ImgFallbackKind>();

  private swapped = false;

  @HostListener('error', ['$event'])
  onError(event: Event): void {
    if (this.swapped) return;
    const img = event.target as HTMLImageElement | null;
    if (!img) return;
    const next = FALLBACK_BY_KIND[this.appImgFallback()];
    if (!next) {
      this.swapped = true;
      return;
    }
    // Browser resolves absolute URLs — compare by path suffix, not raw string.
    if (this.srcAlreadyFallback(img, next)) {
      this.swapped = true;
      return;
    }
    this.swapped = true;
    img.src = next;
  }

  private srcAlreadyFallback(img: HTMLImageElement, fallback: string): boolean {
    const current = img.getAttribute('src') ?? img.src ?? '';
    return (
      current === fallback ||
      current.endsWith(fallback) ||
      current.includes(fallback)
    );
  }
}
