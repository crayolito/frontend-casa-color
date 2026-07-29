import {
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  input,
  OnInit,
} from '@angular/core';

/**
 * Scroll reveal = Salient fade-in puro:
 * opacity 0→1, sin translateY, cubic-bezier(.65,0,.35,1), 0.6s.
 * `delayMs` replica data-delay del page builder (0 / 100 / 200 / …).
 * Sin IntersectionObserver (jsdom) o con reduced-motion → visible al instante.
 */
@Directive({
  selector: '[appReveal]',
  host: {
    class: 'reveal',
    '[style.transition-delay.ms]': 'delayMs()',
  },
})
export class Reveal implements OnInit {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  /** Delay antes de aplicar reveal--visible (ms). Default 0. */
  readonly delayMs = input(0);

  ngOnInit(): void {
    const node = this.el.nativeElement;

    const reducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (reducedMotion || typeof IntersectionObserver === 'undefined') {
      node.classList.add('reveal--visible');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            node.classList.add('reveal--visible');
            observer.disconnect();
          }
        }
      },
      { threshold: 0.15 },
    );

    observer.observe(node);
    this.destroyRef.onDestroy(() => observer.disconnect());
  }
}
