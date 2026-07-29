import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { catchError, of, switchMap, tap } from 'rxjs';
import { ProductsPublicApi } from '../../../core/http/products-public.api';
import {
  ResolvedErrorMessage,
  localErrorMessage,
  resolveErrorMessage,
} from '../../../shared/errors/resolve-error-message';
import { Container } from '../../../shared/ui/container/container';
import { ProductCard } from '../../../shared/ui/product-card/product-card';
import { ProductGallery } from '../ui/product-gallery/product-gallery';
import { ProductSummary } from '../ui/product-summary/product-summary';
import { ProductDescriptionTab } from '../ui/product-description-tab/product-description-tab';
import {
  mapPublicProductToView,
  mapRelatedProducts,
} from '../util/map-public-product';
import { ProductoView } from '../util/producto-view.model';

const RELATED_LIMIT = 4;

@Component({
  selector: 'app-producto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    Container,
    ProductCard,
    ProductGallery,
    ProductSummary,
    ProductDescriptionTab,
    RouterLink,
  ],
  templateUrl: './producto.html',
  styleUrl: './producto.css',
})
export class Producto implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly productsApi = inject(ProductsPublicApi);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly view = signal<ProductoView | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<ResolvedErrorMessage | null>(null);

  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        tap(() => {
          this.loading.set(true);
          this.error.set(null);
          this.view.set(null);
        }),
        switchMap((params) => {
          const slug = params.get('slug');
          if (!slug) {
            this.error.set(localErrorMessage('Producto no encontrado'));
            return of(null);
          }
          return this.loadProduct(slug);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (view) => {
          this.loading.set(false);
          if (view) this.view.set(view);
        },
      });
  }

  protected retry(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) return;
    this.loading.set(true);
    this.error.set(null);
    this.loadProduct(slug)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (view) => {
          this.loading.set(false);
          if (view) this.view.set(view);
        },
      });
  }

  private loadProduct(slug: string) {
    return this.productsApi.getBySlug(slug).pipe(
      switchMap((product) =>
        this.productsApi
          .list({
            catalogId: product.catalogId,
            page: 1,
            limit: RELATED_LIMIT + 1,
          })
          .pipe(
            catchError(() => of({ data: [], meta: { page: 1, limit: 0, total: 0, totalPages: 0 } })),
            switchMap((relatedRes) =>
              of(
                mapPublicProductToView(
                  product,
                  mapRelatedProducts(relatedRes.data, product.slug, RELATED_LIMIT),
                ),
              ),
            ),
          ),
      ),
      catchError((err: unknown) => {
        this.error.set(resolveErrorMessage(err));
        return of(null);
      }),
    );
  }
}
