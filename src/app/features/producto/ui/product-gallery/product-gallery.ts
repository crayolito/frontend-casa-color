import { DOCUMENT } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  inject,
  input,
  OnDestroy,
  signal,
  viewChild,
} from '@angular/core';
import { GalleryImage } from '../../util/producto-data';

/**
 * Galería single-product: thumbs + easyzoom (hover, fondo #fff) + lightbox (lupa).
 * Cascada clon: element easyzoom en nectar-single-product.js + woocommerce.css.
 */
@Component({
  selector: 'app-product-gallery',
  templateUrl: './product-gallery.html',
  styleUrl: './product-gallery.css',
})
export class ProductGallery implements OnDestroy {
  private readonly document = inject(DOCUMENT);

  readonly images = input.required<GalleryImage[]>();
  protected readonly activeIndex = signal(0);
  protected readonly lightboxOpen = signal(false);

  /** easyzoom flyout visible */
  protected readonly zoomOpen = signal(false);
  protected readonly zoomReady = signal(false);
  protected readonly zoomStyle = signal<Record<string, string>>({
    top: '0px',
    left: '0px',
  });

  private readonly zoomTarget =
    viewChild<ElementRef<HTMLElement>>('zoomTarget');

  private zoomNaturalW = 0;
  private zoomNaturalH = 0;
  private loadedLargeSrc: string | null = null;

  protected select(index: number): void {
    this.hideZoom();
    this.activeIndex.set(index);
  }

  protected activeImage(): GalleryImage {
    return this.images()[this.activeIndex()];
  }

  /** Desktop only — nectar: !body.mobile */
  private canHoverZoom(): boolean {
    return (this.document.defaultView?.innerWidth ?? 0) > 999;
  }

  protected onZoomEnter(event: MouseEvent): void {
    if (!this.canHoverZoom() || this.lightboxOpen()) return;
    this.showZoom(event);
  }

  protected onZoomMove(event: MouseEvent): void {
    if (!this.zoomOpen() || !this.canHoverZoom()) return;
    this.moveZoom(event);
  }

  protected onZoomLeave(): void {
    this.hideZoom();
  }

  private showZoom(event: MouseEvent): void {
    const img = this.activeImage();
    this.zoomOpen.set(true);
    this.ensureLargeLoaded(img.largeSrc, () => {
      if (!this.zoomOpen()) return;
      this.zoomReady.set(true);
      this.moveZoom(event);
    });
  }

  private ensureLargeLoaded(src: string, done: () => void): void {
    if (this.loadedLargeSrc === src && this.zoomNaturalW > 0) {
      done();
      return;
    }
    this.zoomReady.set(false);
    const el = new Image();
    el.onload = () => {
      this.zoomNaturalW = el.naturalWidth;
      this.zoomNaturalH = el.naturalHeight;
      this.loadedLargeSrc = src;
      done();
    };
    el.onerror = () => {
      this.hideZoom();
    };
    el.src = src;
  }

  private moveZoom(event: MouseEvent): void {
    const target = this.zoomTarget()?.nativeElement;
    if (!target || !this.zoomNaturalW) return;

    const rect = target.getBoundingClientRect();
    const tw = rect.width;
    const th = rect.height;
    if (tw <= 0 || th <= 0) return;

    // easyzoom: flyout = same size as target; zoom img at natural size
    const ratioX = (this.zoomNaturalW - tw) / tw;
    const ratioY = (this.zoomNaturalH - th) / th;

    let mx = event.clientX - rect.left;
    let my = event.clientY - rect.top;
    mx = Math.max(0, Math.min(mx, tw));
    my = Math.max(0, Math.min(my, th));

    const left = Math.ceil(mx * ratioX);
    const top = Math.ceil(my * ratioY);

    this.zoomStyle.set({
      top: `${-top}px`,
      left: `${-left}px`,
      width: `${this.zoomNaturalW}px`,
      height: `${this.zoomNaturalH}px`,
    });
  }

  private hideZoom(): void {
    this.zoomOpen.set(false);
    this.zoomReady.set(false);
  }

  protected openLightbox(index = this.activeIndex()): void {
    this.hideZoom();
    this.activeIndex.set(index);
    this.lightboxOpen.set(true);
    this.document.body.style.overflow = 'hidden';
  }

  protected closeLightbox(): void {
    this.lightboxOpen.set(false);
    this.document.body.style.overflow = '';
  }

  protected prev(): void {
    const n = this.images().length;
    if (n < 2) return;
    this.activeIndex.update((i) => (i - 1 + n) % n);
  }

  protected next(): void {
    const n = this.images().length;
    if (n < 2) return;
    this.activeIndex.update((i) => (i + 1) % n);
  }

  @HostListener('document:keydown', ['$event'])
  protected onKeydown(event: KeyboardEvent): void {
    if (!this.lightboxOpen()) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      this.closeLightbox();
      return;
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.prev();
      return;
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.next();
    }
  }

  ngOnDestroy(): void {
    this.document.body.style.overflow = '';
  }
}
