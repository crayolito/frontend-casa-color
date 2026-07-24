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

  protected readonly current = signal(0);
  protected readonly paused = signal(false);

  private timerSub: Subscription | null = null;

  constructor() {
    effect(() => {
      const b = this.banner();
      this.restartTimer(b);
    });
  }

  ngOnInit(): void {
    this.restartTimer(this.banner());
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

  private restartTimer(banner: HomeBanner): void {
    this.timerSub?.unsubscribe();
    this.timerSub = null;

    const prefersReducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion || !banner.autoplay) {
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
