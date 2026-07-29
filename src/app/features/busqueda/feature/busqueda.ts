import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute } from '@angular/router';
import {
  Observable,
  catchError,
  forkJoin,
  map,
  of,
  switchMap,
  tap,
} from 'rxjs';
import {
  CatalogsPublicApi,
  PublicCatalog,
} from '../../../core/http/catalogs-public.api';
import {
  CategoriesPublicApi,
  PublicCategory,
} from '../../../core/http/categories-public.api';
import {
  ProductsPublicApi,
} from '../../../core/http/products-public.api';
import { PaginatedResult } from '../../../core/http/api.service';
import {
  ResolvedErrorMessage,
  resolveErrorMessage,
} from '../../../shared/errors/resolve-error-message';
import { Container } from '../../../shared/ui/container/container';
import { SearchCategoryAccordion } from '../ui/search-category-accordion/search-category-accordion';
import { SearchProductCard } from '../ui/search-product-card/search-product-card';
import {
  SearchCategoryGroup,
  groupByCategoryId,
} from '../util/search-category-group';
import {
  SearchProductCardItem,
  buildTypedPrefix,
  mapProductToSearchCard,
} from '../util/search-product-card-item';

const PAGE_SIZE = 12;
const TREE_PAGE_SIZE = 100;

@Component({
  selector: 'app-busqueda',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Container, SearchCategoryAccordion, SearchProductCard],
  templateUrl: './busqueda.html',
  styleUrl: './busqueda.css',
})
export class Busqueda implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly productsApi = inject(ProductsPublicApi);
  private readonly categoriesApi = inject(CategoriesPublicApi);
  private readonly catalogsApi = inject(CatalogsPublicApi);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly pageSize = PAGE_SIZE;
  protected readonly query = signal('');
  protected readonly products = signal<SearchProductCardItem[]>([]);
  protected readonly typedPrefix = signal<SearchProductCardItem[]>([]);
  protected readonly categoryGroups = signal<SearchCategoryGroup[]>([]);
  protected readonly loading = signal(true);
  protected readonly treeLoading = signal(true);
  protected readonly error = signal<ResolvedErrorMessage | null>(null);
  protected readonly treeError = signal<ResolvedErrorMessage | null>(null);
  protected readonly currentPage = signal(1);
  protected readonly total = signal(0);
  protected readonly totalPages = signal(0);

  private categoriesCache: PublicCategory[] = [];
  private catalogsCache: PublicCatalog[] = [];

  protected readonly pageNumbers = computed(() => {
    const pages = this.totalPages();
    return Array.from({ length: pages }, (_, i) => i + 1);
  });

  protected readonly resultRange = computed(() => {
    const total = this.total();
    if (total === 0) return { from: 0, to: 0, total: 0 };
    const page = this.currentPage();
    const from = (page - 1) * PAGE_SIZE + 1;
    const to = Math.min(page * PAGE_SIZE, total);
    return { from, to, total };
  });

  ngOnInit(): void {
    this.loadTree();

    this.route.queryParamMap
      .pipe(
        tap((params) => {
          const q = (params.get('q') ?? '').trim();
          this.query.set(q);
          this.currentPage.set(1);
          this.loading.set(true);
          this.error.set(null);
          this.refreshTypedPrefix(q);
        }),
        switchMap((params) => {
          const q = (params.get('q') ?? '').trim();
          if (!q) {
            this.products.set([]);
            this.typedPrefix.set([]);
            this.total.set(0);
            this.totalPages.set(0);
            this.loading.set(false);
            return of(null);
          }
          return this.fetchPage(q, 1);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe();
  }

  protected goToPage(n: number): void {
    const pages = this.totalPages();
    if (n < 1 || n > pages || n === this.currentPage()) return;
    const q = this.query();
    if (!q) return;
    this.loading.set(true);
    this.error.set(null);
    this.fetchPage(q, n)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  protected retry(): void {
    const q = this.query();
    if (!q) return;
    this.loading.set(true);
    this.error.set(null);
    this.fetchPage(q, this.currentPage())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  protected retryTree(): void {
    this.loadTree();
  }

  private loadTree(): void {
    this.treeLoading.set(true);
    this.treeError.set(null);
    forkJoin({
      categories: this.fetchAllPages((page) =>
        this.categoriesApi.list(page, TREE_PAGE_SIZE),
      ),
      catalogs: this.fetchAllPages((page) =>
        this.catalogsApi.list(page, TREE_PAGE_SIZE),
      ),
    })
      .pipe(
        catchError((err: unknown) => {
          this.treeError.set(resolveErrorMessage(err));
          this.treeLoading.set(false);
          this.categoryGroups.set([]);
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((res) => {
        this.treeLoading.set(false);
        if (!res) return;
        this.categoriesCache = res.categories;
        this.catalogsCache = res.catalogs;
        this.categoryGroups.set(
          groupByCategoryId(res.categories, res.catalogs),
        );
        this.refreshTypedPrefix(this.query());
      });
  }

  private refreshTypedPrefix(q: string): void {
    if (!q) {
      this.typedPrefix.set([]);
      return;
    }
    this.typedPrefix.set(
      buildTypedPrefix(q, this.categoriesCache, this.catalogsCache),
    );
  }

  private fetchPage(q: string, page: number) {
    return this.productsApi
      .list({
        search: q,
        page,
        limit: PAGE_SIZE,
      })
      .pipe(
        catchError((err: unknown) => {
          this.error.set(resolveErrorMessage(err));
          this.loading.set(false);
          this.products.set([]);
          this.total.set(0);
          this.totalPages.set(0);
          return of(null);
        }),
        tap((res) => {
          this.loading.set(false);
          if (!res) return;
          this.currentPage.set(res.meta.page);
          this.total.set(res.meta.total);
          this.totalPages.set(res.meta.totalPages);
          this.products.set(res.data.map(mapProductToSearchCard));
        }),
      );
  }

  private fetchAllPages<T>(
    fetchPage: (page: number) => Observable<PaginatedResult<T>>,
  ): Observable<T[]> {
    return fetchPage(1).pipe(
      switchMap((first) => {
        const pages = first.meta.totalPages;
        if (pages <= 1) return of(first.data);
        const rest = Array.from({ length: pages - 1 }, (_, i) =>
          fetchPage(i + 2),
        );
        return forkJoin(rest).pipe(
          map((results) => [
            ...first.data,
            ...results.flatMap((r) => r.data),
          ]),
        );
      }),
    );
  }
}
