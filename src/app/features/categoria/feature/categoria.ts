import {
  Component,
  ElementRef,
  OnInit,
  effect,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Container } from '../../../shared/ui/container/container';
import { SafeHtmlPipe } from '../../../shared/pipes/safe-html.pipe';
import { Reveal } from '../../../shared/util/reveal/reveal';
import {
  ResolvedErrorMessage,
  localErrorMessage,
  resolveErrorMessage,
} from '../../../shared/errors/resolve-error-message';
import {
  withCatalogFallback,
  withCategoryFallback,
} from '../../../shared/util/default-images';
import { CategoriaApi } from '../data/categoria.api';
import { CategoryDetail } from '../data/categoria.model';

/** Delay entre cards (ms) — replica data-delay escalonado Salient. */
const REVEAL_STAGGER_MS = 50;

@Component({
  selector: 'app-categoria',
  imports: [Container, RouterLink, SafeHtmlPipe, Reveal],
  templateUrl: './categoria.html',
  styleUrl: './categoria.css',
})
export class Categoria implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(CategoriaApi);

  private readonly heroEl = viewChild<ElementRef<HTMLElement>>('hero');

  protected readonly content = signal<CategoryDetail | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<ResolvedErrorMessage | null>(null);
  /** Offset Y del parallax bg_only (px), patrón Salient / hero-slider. */
  protected readonly parallaxY = signal(0);

  private parallaxRaf = 0;
  private inView = false;

  constructor() {
    effect((onCleanup) => {
      const ref = this.heroEl();
      if (!ref) {
        this.parallaxY.set(0);
        return;
      }
      const teardown = this.setupParallax(ref.nativeElement);
      onCleanup(() => teardown());
    });
  }

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) {
      this.loading.set(false);
      this.error.set(localErrorMessage('Categoría no encontrada'));
      return;
    }
    this.load(slug);
  }

  protected load(slug?: string): void {
    const resolved =
      slug ??
      this.route.snapshot.paramMap.get('slug') ??
      this.content()?.slug;
    if (!resolved) return;

    this.loading.set(true);
    this.error.set(null);
    this.api.loadCategoria(resolved).subscribe({
      next: (data) => {
        this.content.set(data);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.loading.set(false);
        this.error.set(resolveErrorMessage(err));
      },
    });
  }

  protected heroBg(imageUrl: string | null): string {
    const url = withCategoryFallback(imageUrl).replace(/'/g, "\\'");
    return `url('${url}')`;
  }

  protected catalogImage(url: string | null): string {
    return withCatalogFallback(url);
  }

  protected revealDelay(index: number): number {
    return index * REVEAL_STAGGER_MS;
  }

  private setupParallax(el: HTMLElement): () => void {
    if (typeof window === 'undefined' || this.prefersReducedMotion()) {
      return () => undefined;
    }
    if (typeof IntersectionObserver === 'undefined') {
      return () => undefined;
    }

    const onScroll = (): void => {
      if (!this.inView) return;
      cancelAnimationFrame(this.parallaxRaf);
      this.parallaxRaf = requestAnimationFrame(() => this.updateParallax(el));
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          this.inView = entry.isIntersecting;
          if (this.inView) {
            this.updateParallax(el);
          }
        }
      },
      { threshold: 0 },
    );

    observer.observe(el);
    window.addEventListener('scroll', onScroll, { passive: true });
    this.updateParallax(el);

    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(this.parallaxRaf);
      this.inView = false;
      this.parallaxY.set(0);
    };
  }

  /** Parallax bg_only: mueve el fondo ~15% de la altura del hero según scroll. */
  private updateParallax(el: HTMLElement): void {
    const rect = el.getBoundingClientRect();
    const height = rect.height || 1;
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
}
