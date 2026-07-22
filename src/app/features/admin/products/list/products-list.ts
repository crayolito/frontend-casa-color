import {
  Component,
  ChangeDetectionStrategy,
  DestroyRef,
  inject,
  signal,
  computed,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import {
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  of,
  switchMap,
  tap,
  catchError,
} from 'rxjs';
import { ProductsApi } from '../../data/products.api';
import { CategoriesApi } from '../../data/categories.api';
import { CatalogsApi } from '../../data/catalogs.api';
import { Catalog, Category, Product } from '../../data/admin.models';
import { PaginatedMeta } from '../../../../core/http/api.service';
import { isAppError } from '../../../../shared/util/api-errors';
import { AdminPageHeader } from '../../../../shared/admin-ui/admin-page-header/admin-page-header';
import {
  AdminTable,
  AdminTableColumn,
} from '../../../../shared/admin-ui/admin-table/admin-table';
import { AdminConfirmDialog } from '../../../../shared/admin-ui/admin-confirm-dialog/admin-confirm-dialog';
import { AdminFilters } from '../../../../shared/admin-ui/admin-filters/admin-filters';
import { AdminIcon } from '../../../../shared/admin-ui/icons/admin-icon';

@Component({
  selector: 'app-admin-products-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    FormsModule,
    AdminPageHeader,
    AdminTable,
    AdminConfirmDialog,
    AdminFilters,
    AdminIcon,
  ],
  templateUrl: './products-list.html',
  styleUrl: './products-list.css',
})
export class AdminProductsList {
  private readonly api = inject(ProductsApi);
  private readonly categoriesApi = inject(CategoriesApi);
  private readonly catalogsApi = inject(CatalogsApi);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly rows = signal<Product[]>([]);
  readonly meta = signal<PaginatedMeta | null>(null);
  readonly loading = signal(true);
  readonly initialLoad = signal(true);
  readonly saving = signal(false);
  readonly flash = signal<string | null>(null);
  readonly error = signal<string | null>(null);
  readonly deleteTarget = signal<Product | null>(null);

  readonly categories = signal<Category[]>([]);
  readonly catalogs = signal<Catalog[]>([]);

  readonly search = signal('');
  readonly categoryId = signal<number | null>(null);
  readonly catalogId = signal<number | null>(null);
  readonly page = signal(1);

  readonly hasActiveFilters = computed(
    () =>
      !!this.search().trim() ||
      this.categoryId() !== null ||
      this.catalogId() !== null,
  );

  readonly emptyMessage = computed(() =>
    this.hasActiveFilters()
      ? 'No se encontraron productos con esos filtros'
      : 'No hay productos todavía',
  );

  readonly columns: AdminTableColumn<Product>[] = [
    { key: 'id', label: 'ID', cell: (r) => String(r.id) },
    { key: 'title', label: 'Título', cell: (r) => r.title },
    { key: 'slug', label: 'Slug', cell: (r) => r.slug },
    {
      key: 'active',
      label: 'Activo',
      cell: (r) => (r.isActive ? 'Sí' : 'No'),
    },
    { key: 'order', label: 'Orden', cell: (r) => String(r.displayOrder) },
  ];

  constructor() {
    this.categoriesApi.list(1, 100).subscribe({
      next: (res) => this.categories.set(res.data),
    });

    // Hydrate from URL
    const qp = this.route.snapshot.queryParamMap;
    this.search.set(qp.get('q') ?? '');
    const cat = qp.get('categoryId');
    const catalog = qp.get('catalogId');
    const page = qp.get('page');
    if (cat) this.categoryId.set(Number(cat));
    if (catalog) this.catalogId.set(Number(catalog));
    if (page) this.page.set(Number(page) || 1);

    // Catalogs depend on category
    toObservable(this.categoryId)
      .pipe(
        switchMap((categoryId) =>
          this.catalogsApi.list(1, 100, categoryId ?? undefined),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (res) => this.catalogs.set(res.data),
      });

    // Main list query with debounce + cancelation via switchMap
    combineLatest([
      toObservable(this.search).pipe(debounceTime(300), distinctUntilChanged()),
      toObservable(this.categoryId),
      toObservable(this.catalogId),
      toObservable(this.page),
    ])
      .pipe(
        tap(() => {
          this.loading.set(true);
          this.error.set(null);
          this.syncUrl();
        }),
        switchMap(([search, categoryId, catalogId, page]) =>
          this.api
            .list({
              page,
              limit: 20,
              search: search.trim() || undefined,
              categoryId: categoryId ?? undefined,
              catalogId: catalogId ?? undefined,
            })
            .pipe(
              catchError((err: unknown) => {
                this.error.set(
                  isAppError(err) ? err.message : 'Error al cargar',
                );
                return of(null);
              }),
            ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (res) => {
          this.loading.set(false);
          this.initialLoad.set(false);
          if (!res) return;
          this.rows.set(res.data);
          this.meta.set(res.meta);
        },
      });
  }

  private syncUrl(): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        q: this.search().trim() || null,
        categoryId: this.categoryId(),
        catalogId: this.catalogId(),
        page: this.page() > 1 ? this.page() : null,
      },
      queryParamsHandling: 'merge',
      replaceUrl: true,
    });
  }

  onSearchInput(value: string): void {
    this.search.set(value);
    this.page.set(1);
  }

  onCategoryChange(value: string): void {
    this.categoryId.set(value ? Number(value) : null);
    this.catalogId.set(null);
    this.page.set(1);
  }

  onCatalogChange(value: string): void {
    this.catalogId.set(value ? Number(value) : null);
    this.page.set(1);
  }

  clearFilters(): void {
    this.search.set('');
    this.categoryId.set(null);
    this.catalogId.set(null);
    this.page.set(1);
  }

  onEdit(row: Product): void {
    void this.router.navigate(['/admin/products', row.id, 'edit']);
  }

  askDelete(row: Product): void {
    this.deleteTarget.set(row);
  }

  confirmDelete(): void {
    const target = this.deleteTarget();
    if (!target) return;
    this.saving.set(true);
    this.api.remove(target.id).subscribe({
      next: () => {
        this.saving.set(false);
        this.deleteTarget.set(null);
        this.flash.set('Producto eliminado');
        this.page.set(this.page()); // retrigger
        // Force reload by re-setting page
        this.loading.set(true);
        this.api
          .list({
            page: this.page(),
            limit: 20,
            search: this.search().trim() || undefined,
            categoryId: this.categoryId() ?? undefined,
            catalogId: this.catalogId() ?? undefined,
          })
          .subscribe({
            next: (res) => {
              this.rows.set(res.data);
              this.meta.set(res.meta);
              this.loading.set(false);
            },
          });
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.error.set(isAppError(err) ? err.message : 'Error al eliminar');
      },
    });
  }

  onPageChange(page: number): void {
    this.page.set(page);
  }
}
