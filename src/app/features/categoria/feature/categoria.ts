import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Container } from '../../../shared/ui/container/container';
import { SafeHtmlPipe } from '../../../shared/pipes/safe-html.pipe';
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

@Component({
  selector: 'app-categoria',
  imports: [Container, RouterLink, SafeHtmlPipe],
  templateUrl: './categoria.html',
  styleUrl: './categoria.css',
})
export class Categoria implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly api = inject(CategoriaApi);

  protected readonly content = signal<CategoryDetail | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<ResolvedErrorMessage | null>(null);

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

  protected heroStyle(imageUrl: string | null): Record<string, string> {
    return {
      'background-image': `url('${withCategoryFallback(imageUrl)}')`,
    };
  }

  protected catalogImage(url: string | null): string {
    return withCatalogFallback(url);
  }
}
