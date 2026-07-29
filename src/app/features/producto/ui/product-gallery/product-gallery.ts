import { DOCUMENT } from '@angular/common';
import {
  Component,
  ElementRef,
  HostListener,
  NgZone,
  inject,
  input,
  OnDestroy,
  signal,
  viewChild,
} from '@angular/core';
import { GalleryImage } from '../../util/producto-view.model';

/**
 * Galería single-product: thumbs + easyzoom (hover, fondo #fff) + lightbox (lupa).
 * Cascada clon: nectar-single-product.js easyzoom + product-single.css.
 *
 * Zoom: top/left por DOM directo fuera de NgZone (como jQuery .css) para fluidez.
 */
@Component({
  selector: 'app-product-gallery',
  templateUrl: './product-gallery.html',
  styleUrl: './product-gallery.css',
})
export class ProductGallery implements OnDestroy {
  private readonly document = inject(DOCUMENT);
  private readonly zone = inject(NgZone);

  readonly images = input.required<GalleryImage[]>();
  protected readonly activeIndex = signal(0);
  protected readonly lightboxOpen = signal(false);

  protected readonly zoomOpen = signal(false);
  protected readonly zoomReady = signal(false);

  private readonly zoomTarget =
    viewChild<ElementRef<HTMLElement>>('zoomTarget');
  private readonly zoomImgRef =
    viewChild<ElementRef<HTMLImageElement>>('zoomImg');

  private zoomNaturalW = 0;
  private zoomNaturalH = 0;
  private ratioX = 0;
  private ratioY = 0;
  private excessW = 0;
  private excessH = 0;
  private loadedLargeSrc: string | null = null;
  private rafId = 0;
  private pendingMove: MouseEvent | null = null;
  private isZoomMeasured = false;

  protected select(index: number): void {
    this.hideZoom();
    this.activeIndex.set(index);
    this.loadedLargeSrc = null;
    this.zoomNaturalW = 0;
    this.zoomNaturalH = 0;
    this.isZoomMeasured = false;
    this.zoomReady.set(false);
  }

  protected activeImage(): GalleryImage {
    return this.images()[this.activeIndex()];
  }

  private canHoverZoom(): boolean {
    return (this.document.defaultView?.innerWidth ?? 0) > 999;
  }

  protected onZoomEnter(event: MouseEvent): void {
    if (!this.canHoverZoom() || this.lightboxOpen()) return;
    this.showZoom(event);
  }

  protected onZoomMove(event: MouseEvent): void {
    if (!this.zoomOpen() || !this.canHoverZoom()) return;
    this.pendingMove = event;
    if (this.rafId) return;
    const win = this.document.defaultView;
    if (!win) return;
    this.zone.runOutsideAngular(() => {
      this.rafId = win.requestAnimationFrame(() => {
        this.rafId = 0;
        const e = this.pendingMove;
        this.pendingMove = null;
        if (e && this.zoomOpen()) this.applyZoomMove(e);
      });
    });
  }

  protected onZoomLeave(): void {
    this.hideZoom();
  }

  private showZoom(event: MouseEvent): void {
    const img = this.activeImage();
    this.zoomOpen.set(true);
    this.ensureLargeLoaded(img.largeSrc, () => {
      if (!this.zoomOpen()) return;
      this.measureZoom();
      this.isZoomMeasured = true;
      this.zone.run(() => this.zoomReady.set(true));
      this.applyZoomMove(event);
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
      this.zone.run(() => this.hideZoom());
    };
    el.src = src;
  }

  /**
   * easyzoom show(): ratios = (zoomSize - flyoutSize) / targetSize.
   * Si la imagen no es mucho más grande que el display, escala a 2× (lupa usable).
   */
  private measureZoom(): void {
    const target = this.zoomTarget()?.nativeElement;
    const zoomImg = this.zoomImgRef()?.nativeElement;
    if (!target || !zoomImg || !this.zoomNaturalW) return;

    const tw = target.clientWidth;
    const th = target.clientHeight;
    if (tw <= 0 || th <= 0) return;

    let zw = this.zoomNaturalW;
    let zh = this.zoomNaturalH;
    const minScale = 2;
    if (zw < tw * minScale || zh < th * minScale) {
      const sx = (tw * minScale) / zw;
      const sy = (th * minScale) / zh;
      const s = Math.max(sx, sy);
      zw = Math.round(zw * s);
      zh = Math.round(zh * s);
    }

    this.excessW = Math.max(0, zw - tw);
    this.excessH = Math.max(0, zh - th);
    this.ratioX = tw > 0 ? this.excessW / tw : 0;
    this.ratioY = th > 0 ? this.excessH / th : 0;

    zoomImg.style.width = `${zw}px`;
    zoomImg.style.height = `${zh}px`;
    zoomImg.style.maxWidth = 'none';
    zoomImg.style.maxHeight = 'none';
  }

  private applyZoomMove(event: MouseEvent): void {
    const target = this.zoomTarget()?.nativeElement;
    const zoomImg = this.zoomImgRef()?.nativeElement;
    if (!target || !zoomImg || !this.isZoomMeasured) return;

    const rect = target.getBoundingClientRect();
    const mx = event.clientX - rect.left;
    const my = event.clientY - rect.top;

    if (mx < 0 || my < 0 || mx > rect.width || my > rect.height) {
      this.zone.run(() => this.hideZoom());
      return;
    }

    const left = Math.ceil(mx * this.ratioX);
    const top = Math.ceil(my * this.ratioY);

    zoomImg.style.top = `${-top}px`;
    zoomImg.style.left = `${-left}px`;
  }

  private hideZoom(): void {
    this.zoomOpen.set(false);
    this.zoomReady.set(false);
    this.isZoomMeasured = false;
    this.pendingMove = null;
    if (this.rafId && this.document.defaultView) {
      this.document.defaultView.cancelAnimationFrame(this.rafId);
      this.rafId = 0;
    }
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
    this.hideZoom();
    this.document.body.style.overflow = '';
  }
}
