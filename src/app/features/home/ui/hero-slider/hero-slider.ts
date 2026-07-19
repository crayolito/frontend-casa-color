import {
  Component,
  DestroyRef,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';
import { Button } from '../../../../shared/ui/button/button';
import { HeroSlide } from '../../../../shared/util/data/home-data';

@Component({
  selector: 'app-hero-slider',
  imports: [Button],
  templateUrl: './hero-slider.html',
  styleUrl: './hero-slider.css',
})
export class HeroSlider implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  readonly slides = input.required<HeroSlide[]>();

  protected readonly current = signal(0);
  protected readonly paused = signal(false);
  private prefersReducedMotion = false;

  ngOnInit(): void {
    this.prefersReducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (this.prefersReducedMotion) {
      return;
    }

    interval(5000)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (!this.paused() && this.slides().length > 1) {
          this.next();
        }
      });
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

  protected background(slide: HeroSlide): string {
    return `url('${slide.backgroundImages[0]}')`;
  }
}
