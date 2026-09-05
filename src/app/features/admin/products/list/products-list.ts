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
import {
  ResolvedErrorMessage,
  resolveErrorMessage,
} from '../../../../shared/errors/resolve-error-message';
import { AdminPageHeader } from '../../../../shared/admin-ui/admin-page-header/admin-page-header';
import {
  AdminTable,
  AdminTableColumn,
  AdminTableCellEvent,
} from '../../../../shared/admin-ui/admin-table/admin-table';
import { AdminConfirmDialog } from '../../../../shared/admin-ui/admin-confirm-dialog/admin-confirm-dialog';
import { AdminFilters } from '../../../../shared/admin-ui/admin-filters/admin-filters';
import { AdminButton } from '../../../../shared/admin-ui/admin-button/admin-button';
import { AdminIconButton } from '../../../../shared/admin-ui/admin-icon-button/admin-icon-button';
import { AdminModal } from '../../../../shared/admin-ui/admin-modal/admin-modal';
import { AdminToastService } from '../../../../shared/admin-ui/admin-toast/admin-toast.service';
import { adminPath } from '../../../../core/routing/admin-path';
import { AdminErrorState } from '../../../../shared/admin-ui/admin-error-state/admin-error-state';
import { AppSelect, SelectOption } from '../../../../shared/ui/select/select';
import { ImgFallback } from '../../../../shared/util/img-fallback/img-fallback';
import { withCatalogFallback } from '../../../../shared/util/default-images';

const PAGE_SIZE = 25;

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
    AdminButton,
    AdminIconButton,
    AdminModal,
    AdminErrorState,
    AppSelect,
    ImgFallback,
  ],
  templateUrl: './products-list.html',
  styleUrl: './products-list.css',
})
export class AdminProductsList {
  protected readonly adminPath = adminPath;
  private readonly api = inject(ProductsApi);
  private readonly categoriesApi = inject(CategoriesApi);
  private readonly catalogsApi = inject(CatalogsApi);
  private readonly toast = inject(AdminToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly rows = signal<Product[]>([]);
  readonly meta = signal<PaginatedMeta | null>(null);
  readonly loading = signal(true);
  readonly initialLoad = signal(true);
  readonly saving = signal(false);
  readonly error = signal<ResolvedErrorMessage | null>(null);
  readonly reloadToken = signal(0);
  readonly deleteTarget = signal<Product | null>(null);
  readonly bulkDeleteOpen = signal(false);
  readonly selectedIds = signal<Set<number>>(new Set());
  readonly detailModal = signal<{
    row: Product;
    kind: 'catalog' | 'category' | 'colors' | 'finishes';
    title: string;
    items: Array<{
      id: number;
      name: string;
      detail?: string;
      hex?: string | null;
      image?: string | null;
    }>;
  } | null>(null);
  readonly detailModalSearch = signal('');

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

  readonly categorySelectOptions = computed((): SelectOption[] => [
    { value: '', label: 'Todas' },
    ...this.categories().map((c) => ({ value: c.id, label: c.name })),
  ]);

  readonly catalogSelectOptions = computed((): SelectOption[] => [
    { value: '', label: 'Todos' },
    ...this.catalogs().map((c) => ({ value: c.id, label: c.name })),
  ]);

  readonly activeSelectOptions: SelectOption[] = [
    { value: '', label: 'Todos' },
    { value: 'true', label: 'Activo' },
    { value: 'false', label: 'Inactivo' },
  ];

  private loadList(search: string): ReturnType<ProductsApi['list']> {
    return this.api.list({
      page: this.page(),
      limit: PAGE_SIZE,
      search: search.trim() || undefined,
      categoryId: this.categoryId() ?? undefined,
      catalogId: this.catalogId() ?? undefined,
      isActive: this.isActive() === null ? undefined : this.isActive()!,
    });
  }

  readonly columns: AdminTableColumn<Product>[] = [
    {
      key: 'image',
      label: 'Imagen',
      cell: () => '',
      image: (r) =>
        r.images?.find((i) => i.isMain)?.url ??
        r.images?.[0]?.url ??
        r.mainImageUrl,
      imageKind: 'product',
    },
    { key: 'title', label: 'Título', cell: (r) => r.title },
    {
      key: 'catalog',
      label: 'Catálogo',
      cell: (r) => String(this.catalogCount(r)),
      action: { icon: 'eye', label: 'Ver catálogos' },
    },
    {
      key: 'colors',
      label: 'Colores',
      cell: (r) => String(r.colorsCount ?? r.colors?.length ?? 0),
      action: { icon: 'eye', label: 'Ver colores' },
    },
    {
      key: 'finishes',
      label: 'Acabados',
      cell: (r) => String(r.finishes?.length ?? 0),
      action: { icon: 'eye', label: 'Ver acabados' },
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
        image: withCatalogFallback(
          this.catalogs().find((cat) => cat.id === c.id)?.imageUrl,
        ),
      }));
      this.detailModal.set({
        row,
        kind: 'catalog',
        title: `Catálogos · ${row.title}`,
        items,
      });
      this.detailModalSearch.set('');
      return;
    }
    if (event.key === 'colors') {
      this.detailModal.set({
        row,
        kind: 'colors',
        title: `Colores · ${row.title}`,
        items: (row.colors ?? []).map((c) => ({
          id: c.id,
          name: c.name,
          hex: c.hexCode,
          detail: c.hexCode ?? undefined,
        })),
      });
      this.detailModalSearch.set('');
      return;
    }
    if (event.key === 'finishes') {
      this.detailModal.set({
        row,
        kind: 'finishes',
        title: `Acabados · ${row.title}`,
        items: (row.finishes ?? []).map((f) => ({
          id: f.id,
          name: f.name,
          image: f.imageUrl ?? row.mainImageUrl,
        })),
      });
      this.detailModalSearch.set('');
    }
  }

  closeDetailModal(): void {
    this.detailModal.set(null);
    this.detailModalSearch.set('');
  }

  readonly filteredDetailItems = computed(() => {
    const modal = this.detailModal();
    if (!modal) return [];
    const q = this.detailModalSearch().trim().toLowerCase();
    if (!q) return modal.items;
    return modal.items.filter((i) => i.name.toLowerCase().includes(q));
  });

  onDetailModalSearch(value: string): void {
    this.detailModalSearch.set(value);
  }

  /** Solo catálogos se pueden desasignar desde este modal (la jerarquía es categoría → catálogo → producto). */
  detailItemCanRemove(item: { id: number; name: string }): boolean {
    const modal = this.detailModal();
    return modal !== null && modal.kind === 'catalog';
  }

  removeDetailItem(item: { id: number; name: string }): void {
    const modal = this.detailModal();
    if (!modal) return;
    const remaining = this.productCatalogs(modal.row)
      .filter((c) => c.id !== item.id)
      .map((c) => c.id);
    this.saving.set(true);
    this.api.update(modal.row.id, { catalogIds: remaining }).subscribe({
      next: (updated) => {
        this.saving.set(false);
        this.rows.update((rows) =>
          rows.map((r) => (r.id === updated.id ? updated : r)),
        );
        this.detailModal.update((m) =>
          m
            ? {
                ...m,
                row: updated,
                items: m.items.filter((i) => i.id !== item.id),
              }
            : m,
        );
        this.toast.success('Producto desasignado del catálogo');
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.toast.error(resolveErrorMessage(err).text);
      },
    });
  }

  onToggleActive(row: Product): void {
    this.saving.set(true);
    this.api.update(row.id, { isActive: !row.isActive }).subscribe({
      next: (updated) => {
        this.saving.set(false);
        this.rows.update((rows) =>
          rows.map((r) => (r.id === updated.id ? { ...r, isActive: updated.isActive } : r)),
        );
        this.toast.success(
          updated.isActive ? 'Producto activado' : 'Producto desactivado',
        );
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.toast.error(resolveErrorMessage(err).text);
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
          this.toast.success(
            isActive
              ? `${ok} producto(s) activado(s)`
              : `${ok} producto(s) desactivado(s)`,
          );
        } else {
          this.toast.error(`${ok} ok, ${fail} fallaron. Revisá e intentá de nuevo.`);
        }
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.toast.error(resolveErrorMessage(err).text);
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
      toObservable(this.isActive).pipe(debounceTime(0)),
      toObservable(this.categoryId).pipe(debounceTime(0)),
      toObservable(this.catalogId).pipe(debounceTime(0)),
      toObservable(this.page).pipe(debounceTime(0)),
      toObservable(this.reloadToken).pipe(debounceTime(0)),
    ])
      .pipe(
        tap(() => {
          this.loading.set(true);
          this.error.set(null);
          this.syncUrl();
        }),
        switchMap(([search]) =>
          this.loadList(search).pipe(
            catchError((err: unknown) => {
              this.error.set(resolveErrorMessage(err));
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

  onRetryLoad(): void {
    this.reloadToken.update((n) => n + 1);
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

  onCategoryChange(value: string | number | null): void {
    this.categoryId.set(value !== null && value !== '' ? Number(value) : null);
    this.catalogId.set(null);
    this.page.set(1);
    this.reloadToken.update((n) => n + 1);
  }

  onCatalogChange(value: string | number | null): void {
    this.catalogId.set(value !== null && value !== '' ? Number(value) : null);
    this.page.set(1);
    this.reloadToken.update((n) => n + 1);
  }

  onActiveChange(value: string | number | null): void {
    if (value === 'true') this.isActive.set(true);
    else if (value === 'false') this.isActive.set(false);
    else this.isActive.set(null);
    this.page.set(1);
    this.reloadToken.update((n) => n + 1);
  }

  clearFilters(): void {
    this.search.set('');
    this.categoryId.set(null);
    this.catalogId.set(null);
    this.isActive.set(null);
    this.page.set(1);
  }

  onEdit(row: Product): void {
    void this.router.navigate([adminPath('products', String(row.id), 'edit')]);
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
        this.toast.success('Producto eliminado');
        this.loading.set(true);
        this.api
          .list({
            page: this.page(),
            limit: PAGE_SIZE,
            search: this.search().trim() || undefined,
            categoryId: this.categoryId() ?? undefined,
            catalogId: this.catalogId() ?? undefined,
            isActive:
              this.isActive() === null ? undefined : this.isActive()!,
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
        this.toast.error(resolveErrorMessage(err).text);
      },
    });
  }

  onPageChange(page: number): void {
    this.page.set(page);
  }

  askBulkDelete(): void {
    if (this.selectedCount() === 0) return;
    this.bulkDeleteOpen.set(true);
  }

  cancelBulkDelete(): void {
    this.bulkDeleteOpen.set(false);
  }

  confirmBulkDelete(): void {
    const ids = [...this.selectedIds()];
    if (ids.length === 0) {
      this.bulkDeleteOpen.set(false);
      return;
    }

    this.saving.set(true);
    this.error.set(null);
    forkJoin(
      ids.map((id) => this.api.remove(id).pipe(catchError(() => of(false as const)))),
    ).subscribe({
      next: (results) => {
        this.saving.set(false);
        this.bulkDeleteOpen.set(false);
        const ok = results.filter((r) => r !== false).length;
        const fail = results.length - ok;
        this.clearSelection();
        this.reloadToken.update((n) => n + 1);
        if (fail === 0) {
          this.toast.success(`${ok} producto(s) eliminado(s)`);
        } else {
          this.toast.error(`${ok} ok, ${fail} fallaron. Revisá e intentá de nuevo.`);
        }
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.toast.error(resolveErrorMessage(err).text);
      },
    });
  }
}
