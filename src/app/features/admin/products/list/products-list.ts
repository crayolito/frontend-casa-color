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
  forkJoin,
  of,
  switchMap,
  tap,
  catchError,
} from 'rxjs';
import { ProductsApi } from '../../data/products.api';
import { CategoriesApi } from '../../data/categories.api';
import { CatalogsApi } from '../../data/catalogs.api';
import { Catalog, Category, Product, ProductCatalogRef } from '../../data/admin.models';
import { PaginatedMeta } from '../../../../core/http/api.service';
import { isAppError } from '../../../../shared/util/api-errors';
import { AdminPageHeader } from '../../../../shared/admin-ui/admin-page-header/admin-page-header';
import {
  AdminTable,
  AdminTableColumn,
  AdminTableCellEvent,
} from '../../../../shared/admin-ui/admin-table/admin-table';
import { AdminConfirmDialog } from '../../../../shared/admin-ui/admin-confirm-dialog/admin-confirm-dialog';
import { AdminFilters } from '../../../../shared/admin-ui/admin-filters/admin-filters';
import { AdminIcon } from '../../../../shared/admin-ui/icons/admin-icon';
import { AdminButton } from '../../../../shared/admin-ui/admin-button/admin-button';
import { AdminModal } from '../../../../shared/admin-ui/admin-modal/admin-modal';

const PAGE_SIZE = 16;

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
    AdminButton,
    AdminModal,
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
  readonly selectedIds = signal<Set<number>>(new Set());
  readonly detailModal = signal<{
    kind: 'catalog' | 'category';
    title: string;
    items: Array<{ id: number; name: string; detail?: string }>;
  } | null>(null);

  readonly categories = signal<Category[]>([]);
  readonly catalogs = signal<Catalog[]>([]);

  readonly search = signal('');
  readonly categoryId = signal<number | null>(null);
  readonly catalogId = signal<number | null>(null);
  readonly isActive = signal<boolean | null>(null);
  readonly page = signal(1);

  readonly hasActiveFilters = computed(
    () =>
      !!this.search().trim() ||
      this.categoryId() !== null ||
      this.catalogId() !== null ||
      this.isActive() !== null,
  );

  readonly emptyMessage = computed(() =>
    this.hasActiveFilters()
      ? 'No se encontraron productos con esos filtros'
      : 'No hay productos todavía',
  );

  readonly selectedCount = computed(() => this.selectedIds().size);

  readonly columns: AdminTableColumn<Product>[] = [
    { key: 'title', label: 'Título', cell: (r) => r.title },
    {
      key: 'catalog',
      label: 'Catálogo',
      cell: (r) => String(this.catalogCount(r)),
      action: { icon: 'list', label: 'Ver catálogos' },
    },
    {
      key: 'category',
      label: 'Categoría',
      cell: (r) => String(this.categoryCount(r)),
      action: { icon: 'list', label: 'Ver categorías' },
    },
    {
      key: 'colors',
      label: 'Colores',
      cell: (r) => String(r.colorsCount ?? r.colors?.length ?? 0),
    },
    {
      key: 'active',
      label: 'Estado',
      cell: (r) => (r.isActive ? 'Activo' : 'Inactivo'),
      click: true,
      badge: (r) => ({
        label: r.isActive ? 'Activo' : 'Inactivo',
        tone: r.isActive ? 'success' : 'danger',
      }),
    },
  ];

  private productCatalogs(row: Product): ProductCatalogRef[] {
    if (row.catalogs?.length) return row.catalogs;
    const fallback = this.catalogs().find((c) => c.id === row.catalogId);
    if (!fallback) return [];
    return [
      {
        id: fallback.id,
        name: fallback.name,
        categoryId: fallback.categoryId,
        categoryName:
          this.categories().find((c) => c.id === fallback.categoryId)?.name ?? '',
      },
    ];
  }

  catalogCount(row: Product): number {
    return this.productCatalogs(row).length;
  }

  categoryCount(row: Product): number {
    const names = new Set(
      this.productCatalogs(row)
        .map((c) => c.categoryName)
        .filter(Boolean),
    );
    return names.size;
  }

  trackProduct = (row: Product): number => row.id;

  onCellClick(event: AdminTableCellEvent<Product>): void {
    if (event.key === 'active') {
      this.onToggleActive(event.row);
    }
  }

  onCellAction(event: AdminTableCellEvent<Product>): void {
    const row = event.row;
    if (event.key === 'catalog') {
      const items = this.productCatalogs(row).map((c) => ({
        id: c.id,
        name: c.name,
        detail: c.categoryName || undefined,
      }));
      this.detailModal.set({
        kind: 'catalog',
        title: `Catálogos · ${row.title}`,
        items,
      });
      return;
    }
    if (event.key === 'category') {
      const byName = new Map<string, { id: number; name: string }>();
      for (const c of this.productCatalogs(row)) {
        if (!c.categoryName) continue;
        if (!byName.has(c.categoryName)) {
          byName.set(c.categoryName, {
            id: c.categoryId,
            name: c.categoryName,
          });
        }
      }
      this.detailModal.set({
        kind: 'category',
        title: `Categorías · ${row.title}`,
        items: [...byName.values()],
      });
    }
  }

  closeDetailModal(): void {
    this.detailModal.set(null);
  }

  onToggleActive(row: Product): void {
    this.saving.set(true);
    this.api.update(row.id, { isActive: !row.isActive }).subscribe({
      next: (updated) => {
        this.saving.set(false);
        this.rows.update((rows) =>
          rows.map((r) => (r.id === updated.id ? { ...r, isActive: updated.isActive } : r)),
        );
        this.flash.set(
          updated.isActive ? 'Producto activado' : 'Producto desactivado',
        );
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.error.set(isAppError(err) ? err.message : 'Error al cambiar estado');
      },
    });
  }

  onSelectionChange(ids: Set<string | number>): void {
    this.selectedIds.set(new Set([...ids].map(Number)));
  }

  clearSelection(): void {
    this.selectedIds.set(new Set());
  }

  bulkSetActive(isActive: boolean): void {
    const ids = [...this.selectedIds()];
    if (ids.length === 0) return;

    this.saving.set(true);
    this.error.set(null);
    this.flash.set(null);

    forkJoin(
      ids.map((id) =>
        this.api.update(id, { isActive }).pipe(catchError(() => of(null))),
      ),
    ).subscribe({
      next: (results) => {
        this.saving.set(false);
        const ok = results.filter((r) => r !== null).length;
        const fail = results.length - ok;
        this.rows.update((rows) =>
          rows.map((r) =>
            this.selectedIds().has(r.id) && results.some((x) => x?.id === r.id)
              ? { ...r, isActive }
              : r,
          ),
        );
        this.clearSelection();
        if (fail === 0) {
          this.flash.set(
            isActive
              ? `${ok} producto(s) activado(s)`
              : `${ok} producto(s) desactivado(s)`,
          );
        } else {
          this.error.set(`${ok} ok, ${fail} fallaron. Revisá e intentá de nuevo.`);
        }
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.error.set(isAppError(err) ? err.message : 'Error en acción masiva');
      },
    });
  }

  constructor() {
    this.categoriesApi.list(1, 100).subscribe({
      next: (res) => this.categories.set(res.data),
    });

    const qp = this.route.snapshot.queryParamMap;
    this.search.set(qp.get('q') ?? '');
    const cat = qp.get('categoryId');
    const catalog = qp.get('catalogId');
    const page = qp.get('page');
    const active = qp.get('isActive');
    if (cat) this.categoryId.set(Number(cat));
    if (catalog) this.catalogId.set(Number(catalog));
    if (page) this.page.set(Number(page) || 1);
    if (active === 'true') this.isActive.set(true);
    if (active === 'false') this.isActive.set(false);

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

    combineLatest([
      toObservable(this.search).pipe(debounceTime(300), distinctUntilChanged()),
      toObservable(this.categoryId),
      toObservable(this.catalogId),
      toObservable(this.isActive),
      toObservable(this.page),
    ])
      .pipe(
        tap(() => {
          this.loading.set(true);
          this.error.set(null);
          this.clearSelection();
          this.syncUrl();
        }),
        switchMap(([search, categoryId, catalogId, isActive, page]) =>
          this.api
            .list({
              page,
              limit: PAGE_SIZE,
              search: search.trim() || undefined,
              categoryId: categoryId ?? undefined,
              catalogId: catalogId ?? undefined,
              isActive: isActive ?? undefined,
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
        isActive:
          this.isActive() === null ? null : this.isActive() ? 'true' : 'false',
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

  onActiveChange(value: string): void {
    if (value === 'true') this.isActive.set(true);
    else if (value === 'false') this.isActive.set(false);
    else this.isActive.set(null);
    this.page.set(1);
  }

  clearFilters(): void {
    this.search.set('');
    this.categoryId.set(null);
    this.catalogId.set(null);
    this.isActive.set(null);
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
        this.loading.set(true);
        this.api
          .list({
            page: this.page(),
            limit: PAGE_SIZE,
            search: this.search().trim() || undefined,
            categoryId: this.categoryId() ?? undefined,
            catalogId: this.catalogId() ?? undefined,
            isActive: this.isActive() ?? undefined,
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
    this.clearSelection();
    this.page.set(page);
  }
}
