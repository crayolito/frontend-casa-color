import {
  Component,
  DestroyRef,
  ElementRef,
  inject,
  input,
  OnInit,
  effect,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import {
  HomeBanner,
  HomeSlide,
  resolveCtaHref,
} from '../../data/home-content.model';

@Component({
  selector: 'app-hero-slider',
  imports: [RouterLink],
  templateUrl: './hero-slider.html',
  styleUrl: './hero-slider.css',
})
export class HeroSlider implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  readonly banner = input.required<HomeBanner>();
  /** Salient home: data-bullets="false". Opt-in si se necesita. */
  readonly showDots = input(false);
  /** Salient home: data-arrows="false". Opt-in si se necesita. */
  readonly showArrows = input(false);

  protected readonly current = signal(0);
  protected readonly paused = signal(false);
  /** Dispara caption fade_in_from_bottom al cambiar slide. */
  protected readonly captionEnter = signal(true);
  /** Offset Y del parallax bg_only (px). */
  protected readonly parallaxY = signal(0);

  private timerSub: Subscription | null = null;
  private captionTimer: ReturnType<typeof setTimeout> | null = null;
  private parallaxRaf = 0;
  private inView = false;

  constructor() {
    effect(() => {
      const b = this.banner();
      this.restartTimer(b);
    });

    effect(() => {
      // Re-dispara caption cada vez que cambia el slide activo.
      this.current();
      this.replayCaption();
    });
  }

  ngOnInit(): void {
    this.restartTimer(this.banner());
    this.setupParallax();
  }

  protected slides(): HomeSlide[] {
    return this.banner().slides ?? [];
  }

  protected goTo(index: number): void {
    const total = this.slides().length;
    if (total === 0) {
      return;
    }
    this.current.set(((index % total) + total) % total);
  }

  protected next(): void {
    this.goTo(this.current() + 1);
  }

  protected prev(): void {
    this.goTo(this.current() - 1);
  }

  protected pause(): void {
    this.paused.set(true);
  }

  protected resume(): void {
    this.paused.set(false);
  }

  protected background(slide: HomeSlide): string {
    return `url('${slide.imageUrl}')`;
  }

  protected slideHref(slide: HomeSlide): string | null {
    return resolveCtaHref(slide);
  }

  protected isInternal(link: string | null): boolean {
    return !!link && link.startsWith('/') && !link.startsWith('//');
  }

  protected scrollToContent(): void {
    this.host.nativeElement.nextElementSibling?.scrollIntoView({
      behavior: 'smooth',
    });
  }

  private replayCaption(): void {
    if (this.prefersReducedMotion()) {
      this.captionEnter.set(true);
      return;
    }
    this.captionEnter.set(false);
    if (this.captionTimer) {
      clearTimeout(this.captionTimer);
    }
    // Un frame para forzar reflow y re-aplicar la animación CSS.
    this.captionTimer = setTimeout(() => {
      this.captionEnter.set(true);
      this.captionTimer = null;
    }, 30);
  }

  private setupParallax(): void {
    if (typeof window === 'undefined' || this.prefersReducedMotion()) {
      return;
    }
    if (typeof IntersectionObserver === 'undefined') {
      return;
    }

    const el = this.host.nativeElement;
    const onScroll = (): void => {
      if (!this.inView) return;
      cancelAnimationFrame(this.parallaxRaf);
      this.parallaxRaf = requestAnimationFrame(() => this.updateParallax());
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          this.inView = entry.isIntersecting;
          if (this.inView) {
            this.updateParallax();
          }
        }
      },
      { threshold: 0 },
    );

    observer.observe(el);
    window.addEventListener('scroll', onScroll, { passive: true });

    this.destroyRef.onDestroy(() => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(this.parallaxRaf);
      if (this.captionTimer) clearTimeout(this.captionTimer);
    });
  }

  /** Parallax bg_only: mueve el fondo ~15% de la altura del hero según scroll. */
  private updateParallax(): void {
    const el = this.host.nativeElement;
    const rect = el.getBoundingClientRect();
    const height = rect.height || 1;
    // 0 cuando el top del hero está en el top del viewport; crece al scrollear.
    const progress = Math.min(1, Math.max(0, -rect.top / height));
    this.parallaxY.set(progress * height * 0.15);
  }

  private prefersReducedMotion(): boolean {
    return (
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }

  private restartTimer(banner: HomeBanner): void {
    this.timerSub?.unsubscribe();
    this.timerSub = null;

    if (this.prefersReducedMotion() || !banner.autoplay) {
      return;
    }

    const ms = Math.max(1000, banner.intervalMs || 4000);
    this.timerSub = interval(ms)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (!this.paused() && this.slides().length > 1) {
          this.next();
        }
      });
  }
}
