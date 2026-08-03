import {
  Component,
  ChangeDetectionStrategy,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { catchError, of, switchMap, tap } from 'rxjs';
import { Container } from '../../../shared/ui/container/container';
import { ProductCard } from '../../../shared/ui/product-card/product-card';
import { ProductItem } from '../../../shared/ui/product-card/product-item';
import {
  CatalogsPublicApi,
  PublicCatalog,
} from '../../../core/http/catalogs-public.api';
import {
  ProductsPublicApi,
  PublicProduct,
} from '../../../core/http/products-public.api';
import {
  ResolvedErrorMessage,
  localErrorMessage,
  resolveErrorMessage,
} from '../../../shared/errors/resolve-error-message';
import {
  withCatalogFallback,
  withProductFallback,
} from '../../../shared/util/default-images';

@Component({
  selector: 'app-catalogo-detalle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Container, ProductCard, RouterLink, FormsModule],
  templateUrl: './catalogo-detalle.html',
  styleUrl: './catalogo-detalle.css',
})
export class CatalogoDetalle implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly catalogsApi = inject(CatalogsPublicApi);
  private readonly productsApi = inject(ProductsPublicApi);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly catalog = signal<PublicCatalog | null>(null);
  protected readonly siblingCatalogs = signal<PublicCatalog[]>([]);
  protected readonly products = signal<ProductItem[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<ResolvedErrorMessage | null>(null);
  protected readonly search = signal('');

  protected readonly categoryName = computed(
    () => this.catalog()?.category?.name ?? '',
  );
  protected readonly catalogName = computed(() => this.catalog()?.name ?? '');

  protected readonly heroStyle = computed(() => ({
    'background-image': `url('${withCatalogFallback(this.catalog()?.imageUrl)}')`,
  }));

  protected readonly filteredProducts = computed(() => {
    const q = this.search().trim().toLowerCase();
    const all = this.products();
    if (!q) return all;
    return all.filter((p) => p.title.toLowerCase().includes(q));
  });

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        tap(() => {
          this.loading.set(true);
          this.error.set(null);
          this.search.set('');
        }),
        switchMap((params) => {
          const slug = params.get('slug');
          if (!slug) {
            this.error.set(localErrorMessage('Catálogo no encontrado'));
            return of(null);
          }
          return this.loadCatalog(slug);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (res) => {
          this.loading.set(false);
          if (!res) {
            this.products.set([]);
            return;
          }
          this.products.set(this.mapProducts(res.data));
        },
      });
  }

  protected onSearchInput(value: string): void {
    this.search.set(value);
  }

  protected catalogThumb(url: string | null): string {
    return withCatalogFallback(url);
  }

  protected retry(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) return;
    this.loading.set(true);
    this.error.set(null);
    this.loadCatalog(slug)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.loading.set(false);
          if (!res) {
            this.products.set([]);
            return;
          }
          this.products.set(this.mapProducts(res.data));
        },
      });
  }

  private loadCatalog(slug: string) {
    return this.catalogsApi.getBySlug(slug).pipe(
      switchMap((cat) => {
        this.catalog.set(cat);
        return this.catalogsApi.list(1, 100, cat.categoryId).pipe(
          switchMap((siblings) => {
            this.siblingCatalogs.set(siblings.data);
            return this.productsApi.list({
              catalogId: cat.id,
              page: 1,
              limit: 100,
            });
          }),
        );
      }),
      catchError((err: unknown) => {
        this.error.set(resolveErrorMessage(err));
        return of(null);
      }),
    );
  }

  private mapProducts(data: PublicProduct[]): ProductItem[] {
    return data.map((p) => {
      const main = withProductFallback(
        p.images?.find((i) => i.isMain)?.url ??
          p.images?.[0]?.url ??
          p.mainImageUrl,
      );
      return {
        title: p.title,
        href: `/producto/${p.slug}`,
        image: main,
        imageWidth: 375,
        imageHeight: 400,
        categories: (p.catalogs ?? []).map((c) => ({
          label: c.categoryName || c.name,
          href: c.categorySlug
            ? `/categoria/${c.categorySlug}/productos`
            : '#',
        })),
      } satisfies ProductItem;
    });
  }
}
