import {
  Component,
  ChangeDetectionStrategy,
  DestroyRef,
  inject,
  signal,
  computed,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, FormsModule, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import {
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  of,
  switchMap,
  tap,
  catchError,
} from 'rxjs';
import { CatalogsApi } from '../data/catalogs.api';
import { CategoriesApi } from '../data/categories.api';
import { ProductsApi } from '../data/products.api';
import { Catalog, Category, Product } from '../data/admin.models';
import { PaginatedMeta } from '../../../core/http/api.service';
import {
  ResolvedErrorMessage,
  resolveErrorMessage,
} from '../../../shared/errors/resolve-error-message';
import { AdminPageHeader } from '../../../shared/admin-ui/admin-page-header/admin-page-header';
import { AdminButton } from '../../../shared/admin-ui/admin-button/admin-button';
import { AdminModal } from '../../../shared/admin-ui/admin-modal/admin-modal';
import { AdminFormField } from '../../../shared/admin-ui/admin-form-field/admin-form-field';
import { AdminConfirmDialog } from '../../../shared/admin-ui/admin-confirm-dialog/admin-confirm-dialog';
import { AdminFilters } from '../../../shared/admin-ui/admin-filters/admin-filters';
import { AdminIconButton } from '../../../shared/admin-ui/admin-icon-button/admin-icon-button';
import { ImageUploader } from '../../../shared/admin-ui/image-uploader/image-uploader';
import { AdminMultiSelect } from '../../../shared/admin-ui/admin-multi-select/admin-multi-select';
import { AdminErrorState } from '../../../shared/admin-ui/admin-error-state/admin-error-state';
import { AdminHtmlEditor } from '../../../shared/admin-ui/admin-html-editor/admin-html-editor';
import { AppSelect, SelectOption } from '../../../shared/ui/select/select';
import { ImgFallback } from '../../../shared/util/img-fallback/img-fallback';
import { DEFAULT_IMAGES } from '../../../shared/util/default-images';
import { AdminToastService } from '../../../shared/admin-ui/admin-toast/admin-toast.service';
import { AdminIcon } from '../../../shared/admin-ui/icons/admin-icon';
import {
  AdminTable,
  AdminTableColumn,
} from '../../../shared/admin-ui/admin-table/admin-table';

const VIEW_MODE_STORAGE_KEY = 'admin.catalogs.view';

interface CategoryItem {
  id: number;
  name: string;
  imageUrl: string | null;
  isPrincipal: boolean;
}

@Component({
  selector: 'app-admin-catalogs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    AdminPageHeader,
    AdminButton,
    AdminIconButton,
    AdminModal,
    AdminFormField,
    AdminConfirmDialog,
    AdminFilters,
    ImageUploader,
    AdminMultiSelect,
    AdminErrorState,
    AdminHtmlEditor,
    AppSelect,
    ImgFallback,
    AdminIcon,
    AdminTable,
  ],
  templateUrl: './catalogs.html',
  styleUrl: './catalogs.css',
})
export class AdminCatalogs {
  private readonly api = inject(CatalogsApi);
  private readonly categoriesApi = inject(CategoriesApi);
  private readonly productsApi = inject(ProductsApi);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toast = inject(AdminToastService);

  readonly rows = signal<Catalog[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly meta = signal<PaginatedMeta | null>(null);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<ResolvedErrorMessage | null>(null);
  readonly reloadToken = signal(0);

  readonly modalOpen = signal(false);
  readonly editing = signal<Catalog | null>(null);
  readonly deleteTarget = signal<Catalog | null>(null);
  readonly extraCategoryIds = signal<number[]>([]);

  readonly productsModal = signal<{
    catalog: Catalog;
    items: Product[];
    loading: boolean;
  } | null>(null);
  readonly productsModalSearch = signal('');
  readonly removingProductId = signal<number | null>(null);

  readonly categoriesModal = signal<{
    catalog: Catalog;
    items: CategoryItem[];
    loading: boolean;
  } | null>(null);
  readonly categoriesModalSearch = signal('');
  readonly removingCategoryId = signal<number | null>(null);

  readonly search = signal('');
  readonly categoryId = signal<number | null>(null);
  readonly page = signal(1);
  readonly sort = signal<'name|asc' | 'name|desc' | 'createdAt|desc' | 'createdAt|asc'>(
    'name|asc',
  );

  readonly sortOptions: SelectOption[] = [
    { value: 'name|asc', label: 'Nombre (A–Z)' },
    { value: 'name|desc', label: 'Nombre (Z–A)' },
    { value: 'createdAt|desc', label: 'Más recientes' },
    { value: 'createdAt|asc', label: 'Más antiguos' },
  ];

  readonly viewMode = signal<'card' | 'list'>(
    localStorage.getItem(VIEW_MODE_STORAGE_KEY) === 'list' ? 'list' : 'card',
  );

  readonly columns: AdminTableColumn<Catalog>[] = [
    {
      key: 'image',
      label: '',
      cell: () => '',
      image: (row) => row.imageUrl ?? null,
      imageKind: 'catalog',
    },
    { key: 'name', label: 'Nombre', cell: (row) => row.name },
    { key: 'slug', label: 'Slug', cell: (row) => row.slug },
    {
      key: 'categories',
      label: 'Categorías',
      cell: (row) => String(this.categoryCount(row)),
      action: { icon: 'eye', label: 'Ver categorías' },
    },
    {
      key: 'products',
      label: 'Productos',
      cell: (row) => String(row.productsCount ?? 0),
      action: { icon: 'eye', label: 'Ver productos' },
    },
  ];

  readonly hasActiveFilters = computed(
    () =>
      !!this.search().trim() ||
      this.categoryId() !== null ||
      this.sort() !== 'name|asc',
  );
  readonly emptyMessage = computed(() =>
    this.hasActiveFilters()
      ? 'No se encontraron catálogos con esos filtros'
      : 'No hay catálogos todavía',
  );

  /** Empty-state banner image (img-auxiliar2) when no catalogs and no filters. */
  readonly emptyBannerSrc = DEFAULT_IMAGES.category;

  /** Exposed for template fallbacks. */
  readonly DEFAULT_IMAGES = DEFAULT_IMAGES;

  readonly categoryOptions = computed(() =>
    this.categories().map((c) => ({ id: c.id, label: c.name })),
  );

  readonly categorySelectOptions = computed((): SelectOption[] => [
    { value: '', label: 'Todas' },
    ...this.categories().map((c) => ({ value: c.id, label: c.name })),
  ]);

  readonly categoryFormOptions = computed((): SelectOption[] => [
    { value: 0, label: 'Sin categoría' },
    ...this.categories().map((c) => ({ value: c.id, label: c.name })),
  ]);

  /** Exposed for template Number() casts. */
  readonly Number = Number;

  readonly form = this.fb.nonNullable.group({
    categoryId: [0],
    name: ['', [Validators.required, Validators.maxLength(150)]],
    description: [''],
    imageUrl: [''],
    pdfUrl: [''],
    pdfButtonLabel: ['Descargar PDF', [Validators.maxLength(50)]],
  });

  constructor() {
    this.categoriesApi.list(1, 100).subscribe({
      next: (res) => this.categories.set(res.data),
    });

    const qp = this.route.snapshot.queryParamMap;
    this.search.set(qp.get('q') ?? '');
    const cat = qp.get('categoryId');
    const page = qp.get('page');
    if (cat) this.categoryId.set(Number(cat));
    if (page) this.page.set(Number(page) || 1);
    const sort = qp.get('sort');
    if (sort && this.isSortValue(sort)) this.sort.set(sort);

    combineLatest([
      toObservable(this.search).pipe(debounceTime(300), distinctUntilChanged()),
      toObservable(this.categoryId),
      toObservable(this.page),
      toObservable(this.sort),
      toObservable(this.reloadToken),
    ])
      .pipe(
        tap(() => {
          this.loading.set(true);
          this.error.set(null);
          this.syncUrl();
        }),
        switchMap(([search, categoryId, page, sort]) => {
          const [sortBy, sortDir] = sort.split('|') as [
            'name' | 'createdAt',
            'asc' | 'desc',
          ];
          return this.api
            .list(
              page,
              20,
              categoryId ?? undefined,
              search.trim() || undefined,
              sortBy,
              sortDir,
            )
            .pipe(
              catchError((err: unknown) => {
                this.error.set(resolveErrorMessage(err));
                return of(null);
              }),
            );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (res) => {
          this.loading.set(false);
          if (!res) return;
          this.rows.set(res.data);
          this.meta.set(res.meta);
        },
      });
  }

  private isSortValue(
    value: string,
  ): value is 'name|asc' | 'name|desc' | 'createdAt|desc' | 'createdAt|asc' {
    return ['name|asc', 'name|desc', 'createdAt|desc', 'createdAt|asc'].includes(value);
  }

  formatCategories(row: Catalog): string {
    const principal =
      row.categoryId != null ? this.categoryName(row.categoryId) : '';
    const extras = (row.extraCategories ?? []).map((c) => c.name);
    const all = [...(principal ? [principal] : []), ...extras];
    return all.join(' · ') || 'Sin categoría';
  }

  categoryName(id: number | null): string {
    if (id === null || id <= 0) return 'Sin categoría';
    return this.categories().find((c) => c.id === id)?.name ?? String(id);
  }

  private syncUrl(): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        q: this.search().trim() || null,
        categoryId: this.categoryId(),
        page: this.page() > 1 ? this.page() : null,
        sort: this.sort() !== 'name|asc' ? this.sort() : null,
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
    this.page.set(1);
  }

  onSortChange(value: string | number | null): void {
    if (value === null || value === '') return;
    const next = String(value);
    if (this.isSortValue(next)) {
      this.sort.set(next);
      this.page.set(1);
    }
  }

  clearFilters(): void {
    this.search.set('');
    this.categoryId.set(null);
    this.sort.set('name|asc');
    this.page.set(1);
  }

  setViewMode(mode: 'card' | 'list'): void {
    this.viewMode.set(mode);
    localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
  }

  readonly filteredModalProducts = computed(() => {
    const modal = this.productsModal();
    if (!modal) return [];
    const q = this.productsModalSearch().trim().toLowerCase();
    if (!q) return modal.items;
    return modal.items.filter((p) => p.title.toLowerCase().includes(q));
  });

  openProducts(row: Catalog): void {
    this.productsModalSearch.set('');
    this.productsModal.set({ catalog: row, items: [], loading: true });
    this.productsApi.list({ catalogId: row.id, limit: 100 }).subscribe({
      next: (res) => {
        this.productsModal.set({ catalog: row, items: res.data, loading: false });
      },
      error: (err: unknown) => {
        this.productsModal.set({ catalog: row, items: [], loading: false });
        this.toast.error(resolveErrorMessage(err).text);
      },
    });
  }

  closeProductsModal(): void {
    this.productsModal.set(null);
    this.productsModalSearch.set('');
  }

  onProductsSearch(value: string): void {
    this.productsModalSearch.set(value);
  }

  removeProductFromCatalog(product: Product): void {
    const modal = this.productsModal();
    if (!modal) return;
    const remaining = (product.catalogs ?? [])
      .map((c) => c.id)
      .filter((id) => id !== modal.catalog.id);
    this.removingProductId.set(product.id);
    this.productsApi.update(product.id, { catalogIds: remaining }).subscribe({
      next: () => {
        this.removingProductId.set(null);
        this.productsModal.update((m) =>
          m
            ? { ...m, items: m.items.filter((p) => p.id !== product.id) }
            : m,
        );
        this.toast.success(`«${product.title}» desasignado del catálogo`);
        this.reload();
      },
      error: (err: unknown) => {
        this.removingProductId.set(null);
        this.toast.error(resolveErrorMessage(err).text);
      },
    });
  }

  reload(): void {
    this.reloadToken.update((n) => n + 1);
  }

  categoryCount(row: Catalog): number {
    const ids = new Set<number>();
    if (row.categoryId != null && row.categoryId > 0) ids.add(row.categoryId);
    for (const id of row.extraCategoryIds ?? []) ids.add(id);
    return ids.size;
  }

  private catalogCategoryItems(row: Catalog): CategoryItem[] {
    const byId = new Map(this.categories().map((c) => [c.id, c]));
    const items: CategoryItem[] = [];
    if (row.categoryId != null && row.categoryId > 0) {
      const c = byId.get(row.categoryId);
      if (c) {
        items.push({
          id: c.id,
          name: c.name,
          imageUrl: c.cardImageUrl ?? c.coverImageUrl,
          isPrincipal: true,
        });
      }
    }
    for (const id of row.extraCategoryIds ?? []) {
      if (id === row.categoryId) continue;
      const c = byId.get(id);
      if (c) {
        items.push({
          id: c.id,
          name: c.name,
          imageUrl: c.cardImageUrl ?? c.coverImageUrl,
          isPrincipal: false,
        });
      }
    }
    return items;
  }

  readonly filteredModalCategories = computed(() => {
    const modal = this.categoriesModal();
    if (!modal) return [];
    const q = this.categoriesModalSearch().trim().toLowerCase();
    if (!q) return modal.items;
    return modal.items.filter((c) => c.name.toLowerCase().includes(q));
  });

  openCategories(row: Catalog): void {
    this.categoriesModalSearch.set('');
    this.categoriesModal.set({
      catalog: row,
      items: this.catalogCategoryItems(row),
      loading: false,
    });
  }

  closeCategoriesModal(): void {
    this.categoriesModal.set(null);
    this.categoriesModalSearch.set('');
  }

  onCategoriesSearch(value: string): void {
    this.categoriesModalSearch.set(value);
  }

  removeCategoryFromCatalog(item: CategoryItem): void {
    const modal = this.categoriesModal();
    if (!modal) return;
    const body = item.isPrincipal
      ? { categoryId: null }
      : {
          extraCategoryIds: modal.catalog.extraCategoryIds.filter(
            (id) => id !== item.id,
          ),
        };
    this.removingCategoryId.set(item.id);
    this.api.update(modal.catalog.id, body).subscribe({
      next: () => {
        this.removingCategoryId.set(null);
        this.categoriesModal.update((m) =>
          m ? { ...m, items: m.items.filter((c) => c.id !== item.id) } : m,
        );
        this.toast.success('Categoría quitada del catálogo');
        this.reload();
      },
      error: (err: unknown) => {
        this.removingCategoryId.set(null);
        this.toast.error(resolveErrorMessage(err).text);
      },
    });
  }

  onRetryLoad(): void {
    this.reload();
  }

  openCreate(): void {
    this.editing.set(null);
    this.extraCategoryIds.set([]);
    this.form.reset({
      categoryId: 0,
      name: '',
      description: '',
      imageUrl: '',
      pdfUrl: '',
      pdfButtonLabel: 'Descargar PDF',
    });
    this.modalOpen.set(true);
  }

  openEdit(row: Catalog): void {
    this.editing.set(row);
    this.extraCategoryIds.set(row.extraCategoryIds ?? []);
    this.form.reset({
      categoryId: row.categoryId ?? 0,
      name: row.name,
      description: row.description ?? '',
      imageUrl: row.imageUrl ?? '',
      pdfUrl: row.pdfUrl ?? '',
      pdfButtonLabel: row.pdfButtonLabel || 'Descargar PDF',
    });
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
  }

  onImageChange(url: string | null): void {
    this.form.controls.imageUrl.setValue(url ?? '');
    this.form.controls.imageUrl.markAsDirty();
  }

  onDescriptionChange(html: string): void {
    this.form.controls.description.setValue(html);
    this.form.controls.description.markAsDirty();
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const body = {
      categoryId: Number(raw.categoryId) > 0 ? Number(raw.categoryId) : null,
      name: raw.name.trim(),
      description: raw.description.trim() || undefined,
      imageUrl: raw.imageUrl.trim() || undefined,
      pdfUrl: raw.pdfUrl.trim() || null,
      pdfButtonLabel: raw.pdfButtonLabel.trim() || 'Descargar PDF',
      extraCategoryIds: this.extraCategoryIds(),
    };
    this.saving.set(true);
    const editing = this.editing();
    const req = editing
      ? this.api.update(editing.id, body)
      : this.api.create(body);

    req.subscribe({
      next: () => {
        this.saving.set(false);
        this.modalOpen.set(false);
        this.toast.success(editing ? 'Catálogo actualizado' : 'Catálogo creado');
        this.reload();
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.error.set(resolveErrorMessage(err));
      },
    });
  }

  askDelete(row: Catalog): void {
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
        this.toast.success('Catálogo eliminado');
        this.reload();
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.error.set(resolveErrorMessage(err));
      },
    });
  }

  onPageChange(page: number): void {
    this.page.set(page);
  }

  onCellAction(event: { row: Catalog; key: string }): void {
    if (event.key === 'products') {
      this.openProducts(event.row);
    } else if (event.key === 'categories') {
      this.openCategories(event.row);
    }
  }
}
