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
import { Subject, catchError, debounceTime, of, switchMap, tap } from 'rxjs';
import { Container } from '../../../shared/ui/container/container';
import { ProductCard } from '../../../shared/ui/product-card/product-card';
import { ProductItem } from '../../../shared/ui/product-card/product-item';
import {
  CategoriesPublicApi,
  PublicCategory,
} from '../../../core/http/categories-public.api';
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
import { AppSelect, SelectOption } from '../../../shared/ui/select/select';

const FALLBACK_PRODUCT_IMAGE = '/img/productos/envase-colom-industria-375x400.jpg';
const PAGE_SIZE = 12;
const SEARCH_DEBOUNCE_MS = 250;

export type ArchiveMode = 'category' | 'catalog';
export type SortValue = 'default' | 'name-asc' | 'name-desc';

export interface ColorFacet {
  name: string;
  hex: string | null;
}

export interface ProductFacets {
  presentations: string[];
  finishes: string[];
  colors: ColorFacet[];
}

interface ArchiveContext {
  mode: ArchiveMode;
  title: string;
  categoryName: string | null;
  categorySlug: string | null;
  catalogSlug: string | null;
}

@Component({
  selector: 'app-categoria-productos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    Container,
    ProductCard,
    RouterLink,
    FormsModule,
    AppSelect,
  ],
  templateUrl: './categoria-productos.html',
  styleUrl: './categoria-productos.css',
})
export class CategoriaProductos implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly categoriesApi = inject(CategoriesPublicApi);
  private readonly catalogsApi = inject(CatalogsPublicApi);
  private readonly productsApi = inject(ProductsPublicApi);
  private readonly destroyRef = inject(DestroyRef);
  private readonly searchInput$ = new Subject<string>();

  protected readonly pageSize = PAGE_SIZE;
  protected readonly sortOptions: SelectOption[] = [
    { value: 'default', label: 'Orden predeterminado' },
    { value: 'name-asc', label: 'Nombre: A–Z' },
    { value: 'name-desc', label: 'Nombre: Z–A' },
  ];
  protected readonly mode = signal<ArchiveMode>('category');
  protected readonly archive = signal<ArchiveContext | null>(null);
  protected readonly allProducts = signal<PublicProduct[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<ResolvedErrorMessage | null>(null);
  protected readonly searchDraft = signal('');
  protected readonly search = signal('');
  protected readonly selectedPresentations = signal<Set<string>>(new Set());
  protected readonly selectedFinishes = signal<Set<string>>(new Set());
  protected readonly selectedColors = signal<Set<string>>(new Set());
  protected readonly sort = signal<SortValue>('default');
  protected readonly currentPage = signal(1);

  protected readonly facets = computed(() =>
    extractFacets(this.allProducts()),
  );

  protected readonly filteredProducts = computed(() =>
    applyFilters(
      this.allProducts(),
      this.search(),
      this.selectedPresentations(),
      this.selectedFinishes(),
      this.selectedColors(),
      this.sort(),
    ),
  );

  protected readonly totalPages = computed(() => {
    const n = this.filteredProducts().length;
    if (n === 0) return 0;
    return Math.ceil(n / PAGE_SIZE);
  });

  protected readonly pagedProducts = computed(() => {
    const page = this.currentPage();
    const start = (page - 1) * PAGE_SIZE;
    return this.filteredProducts().slice(start, start + PAGE_SIZE);
  });

  protected readonly productItems = computed(() =>
    this.pagedProducts().map(toProductItem),
  );

  protected readonly pageNumbers = computed(() => {
    const total = this.totalPages();
    return Array.from({ length: total }, (_, i) => i + 1);
  });

  protected readonly resultRange = computed(() => {
    const total = this.filteredProducts().length;
    if (total === 0) return { from: 0, to: 0, total: 0 };
    const page = this.currentPage();
    const from = (page - 1) * PAGE_SIZE + 1;
    const to = Math.min(page * PAGE_SIZE, total);
    return { from, to, total };
  });

  protected readonly hasActiveFilters = computed(
    () =>
      this.search().trim().length > 0 ||
      this.selectedPresentations().size > 0 ||
      this.selectedFinishes().size > 0 ||
      this.selectedColors().size > 0,
  );

  protected readonly emptyNoProductsMessage = computed(() =>
    this.mode() === 'catalog'
      ? 'Este catálogo todavía no tiene productos.'
      : 'Esta categoría todavía no tiene productos.',
  );

  ngOnInit(): void {
    const routeMode = this.route.snapshot.data['archiveMode'];
    this.mode.set(routeMode === 'catalog' ? 'catalog' : 'category');

    this.searchInput$
      .pipe(debounceTime(SEARCH_DEBOUNCE_MS), takeUntilDestroyed(this.destroyRef))
      .subscribe((value) => {
        this.search.set(value);
        this.currentPage.set(1);
      });

    this.route.paramMap
      .pipe(
        tap(() => {
          this.loading.set(true);
          this.error.set(null);
          this.resetFilters();
        }),
        switchMap((params) => {
          const slug = params.get('slug');
          if (!slug) {
            this.error.set(
              localErrorMessage(
                this.mode() === 'catalog'
                  ? 'Catálogo no encontrado'
                  : 'Categoría no encontrada',
              ),
            );
            return of(null);
          }
          return this.loadArchive(slug);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (res) => {
          this.loading.set(false);
          if (!res) {
            this.allProducts.set([]);
            return;
          }
          this.allProducts.set(res.data);
        },
      });
  }

  protected onSearchInput(value: string): void {
    this.searchDraft.set(value);
    this.searchInput$.next(value);
  }

  protected togglePresentation(name: string): void {
    this.selectedPresentations.set(toggleInSet(this.selectedPresentations(), name));
    this.currentPage.set(1);
  }

  protected toggleFinish(name: string): void {
    this.selectedFinishes.set(toggleInSet(this.selectedFinishes(), name));
    this.currentPage.set(1);
  }

  protected toggleColor(name: string): void {
    this.selectedColors.set(toggleInSet(this.selectedColors(), name));
    this.currentPage.set(1);
  }

  protected isPresentationSelected(name: string): boolean {
    return this.selectedPresentations().has(name);
  }

  protected isFinishSelected(name: string): boolean {
    return this.selectedFinishes().has(name);
  }

  protected isColorSelected(name: string): boolean {
    return this.selectedColors().has(name);
  }

  protected setSort(value: SortValue): void {
    this.sort.set(value);
    this.currentPage.set(1);
  }

  protected onSortChange(value: string | number | null): void {
    if (value === 'default' || value === 'name-asc' || value === 'name-desc') {
      this.setSort(value);
    }
  }

  protected goToPage(n: number): void {
    const total = this.totalPages();
    if (n < 1 || n > total) return;
    this.currentPage.set(n);
  }

  protected clearFilters(): void {
    this.resetFilters();
  }

  protected retry(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (!slug) return;
    this.loading.set(true);
    this.error.set(null);
    this.loadArchive(slug)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.loading.set(false);
          if (!res) {
            this.allProducts.set([]);
            return;
          }
          this.allProducts.set(res.data);
        },
      });
  }

  private resetFilters(): void {
    this.searchDraft.set('');
    this.search.set('');
    this.selectedPresentations.set(new Set());
    this.selectedFinishes.set(new Set());
    this.selectedColors.set(new Set());
    this.sort.set('default');
    this.currentPage.set(1);
  }

  private loadArchive(slug: string) {
    return this.mode() === 'catalog'
      ? this.loadCatalog(slug)
      : this.loadCategory(slug);
  }

  private loadCategory(slug: string) {
    return this.categoriesApi.getBySlug(slug).pipe(
      switchMap((cat: PublicCategory) => {
        this.archive.set({
          mode: 'category',
          title: cat.name,
          categoryName: cat.name,
          categorySlug: cat.slug,
          catalogSlug: null,
        });
        return this.productsApi.list({
          categoryId: cat.id,
          page: 1,
          limit: 100,
        });
      }),
      catchError((err: unknown) => {
        this.error.set(resolveErrorMessage(err));
        return of(null);
      }),
    );
  }

  private loadCatalog(slug: string) {
    return this.catalogsApi.getBySlug(slug).pipe(
      switchMap((cat: PublicCatalog) => {
        this.archive.set({
          mode: 'catalog',
          title: cat.name,
          categoryName: cat.category?.name ?? null,
          categorySlug: cat.category?.slug ?? null,
          catalogSlug: cat.slug,
        });
        return this.productsApi.list({
          catalogId: cat.id,
          page: 1,
          limit: 100,
        });
      }),
      catchError((err: unknown) => {
        this.error.set(resolveErrorMessage(err));
        return of(null);
      }),
    );
  }
}

function toggleInSet(current: Set<string>, value: string): Set<string> {
  const next = new Set(current);
  if (next.has(value)) {
    next.delete(value);
  } else {
    next.add(value);
  }
  return next;
}

export function extractFacets(products: PublicProduct[]): ProductFacets {
  const presentations = new Set<string>();
  const finishes = new Set<string>();
  const colorsMap = new Map<string, string | null>();

  for (const p of products) {
    for (const pr of p.presentations ?? []) {
      const v = pr.value?.trim();
      if (v) presentations.add(v);
    }
    for (const f of p.finishes ?? []) {
      const n = f.name?.trim();
      if (n) finishes.add(n);
    }
    for (const c of p.colors ?? []) {
      const n = c.name?.trim();
      if (!n) continue;
      if (!colorsMap.has(n)) {
        colorsMap.set(n, c.hexCode?.trim() || null);
      }
    }
  }

  return {
    presentations: [...presentations].sort((a, b) => a.localeCompare(b, 'es')),
    finishes: [...finishes].sort((a, b) => a.localeCompare(b, 'es')),
    colors: [...colorsMap.entries()]
      .map(([name, hex]) => ({ name, hex }))
      .sort((a, b) => a.name.localeCompare(b.name, 'es')),
  };
}

export function applyFilters(
  products: PublicProduct[],
  search: string,
  presentations: Set<string>,
  finishes: Set<string>,
  colors: Set<string>,
  sort: SortValue,
): PublicProduct[] {
  const q = search.trim().toLowerCase();
  let result = products.filter((p) => {
    if (q && !p.title.toLowerCase().includes(q)) return false;
    if (presentations.size > 0) {
      const values = new Set((p.presentations ?? []).map((x) => x.value?.trim()));
      let hit = false;
      for (const sel of presentations) {
        if (values.has(sel)) {
          hit = true;
          break;
        }
      }
      if (!hit) return false;
    }
    if (finishes.size > 0) {
      const values = new Set((p.finishes ?? []).map((x) => x.name?.trim()));
      let hit = false;
      for (const sel of finishes) {
        if (values.has(sel)) {
          hit = true;
          break;
        }
      }
      if (!hit) return false;
    }
    if (colors.size > 0) {
      const values = new Set((p.colors ?? []).map((x) => x.name?.trim()));
      let hit = false;
      for (const sel of colors) {
        if (values.has(sel)) {
          hit = true;
          break;
        }
      }
      if (!hit) return false;
    }
    return true;
  });

  if (sort === 'name-asc') {
    result = [...result].sort((a, b) => a.title.localeCompare(b.title, 'es'));
  } else if (sort === 'name-desc') {
    result = [...result].sort((a, b) => b.title.localeCompare(a.title, 'es'));
  }

  return result;
}

function toProductItem(p: PublicProduct): ProductItem {
  const main =
    p.images?.find((i) => i.isMain)?.url ??
    p.images?.[0]?.url ??
    p.mainImageUrl ??
    FALLBACK_PRODUCT_IMAGE;
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
  };
}
