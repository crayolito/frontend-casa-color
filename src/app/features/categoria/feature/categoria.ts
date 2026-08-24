import {
  Component,
  OnInit,
  computed,
  inject,
  signal,
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
import { whatsappHref } from '../../../shared/util/whatsapp';
import { HomeApi } from '../../home/data/home.api';
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
  private readonly homeApi = inject(HomeApi);

  protected readonly content = signal<CategoryDetail | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<ResolvedErrorMessage | null>(null);

  /** Link a WhatsApp del hero: vacío si no hay WhatsApp habilitado (el hero queda como div). */
  protected readonly heroHref = computed(() => {
    const name = this.content()?.name;
    if (!name) {
      return '';
    }
    return whatsappHref(
      this.homeApi.content()?.floating?.whatsapp,
      `Hola, me interesa ${name}`,
    );
  });

  protected readonly heroAriaLabel = computed(() => {
    const name = this.content()?.name ?? '';
    return this.heroHref() ? `Contactar por WhatsApp sobre ${name}` : name;
  });

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
}
