import {
  Component,
  ChangeDetectionStrategy,
  DestroyRef,
  inject,
  signal,
  computed,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormsModule } from '@angular/forms';
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
import { CategoriesApi } from '../data/categories.api';
import { CatalogsApi } from '../data/catalogs.api';
import { Category, Catalog, CatalogWrite } from '../data/admin.models';
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
import { AdminErrorState } from '../../../shared/admin-ui/admin-error-state/admin-error-state';
import { AdminHtmlEditor } from '../../../shared/admin-ui/admin-html-editor/admin-html-editor';
import { AdminSwitch } from '../../../shared/admin-ui/admin-switch/admin-switch';
import { AdminToastService } from '../../../shared/admin-ui/admin-toast/admin-toast.service';
import { ImgFallback } from '../../../shared/util/img-fallback/img-fallback';
import { AppSelect } from '../../../shared/ui/select/select';
import { AdminIcon } from '../../../shared/admin-ui/icons/admin-icon';
import {
  AdminTable,
  AdminTableColumn,
} from '../../../shared/admin-ui/admin-table/admin-table';

const VIEW_MODE_STORAGE_KEY = 'admin.categories.view.v2';

@Component({
  selector: 'app-admin-categories',
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
    AdminErrorState,
    AdminHtmlEditor,
    ImgFallback,
    AppSelect,
    AdminIcon,
    AdminTable,
    AdminSwitch,
  ],
  templateUrl: './categories.html',
  styleUrl: './categories.css',
})
export class AdminCategories {
  private readonly api = inject(CategoriesApi);
  private readonly catalogsApi = inject(CatalogsApi);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toast = inject(AdminToastService);

  readonly rows = signal<Category[]>([]);
  readonly meta = signal<PaginatedMeta | null>(null);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<ResolvedErrorMessage | null>(null);
  readonly reloadToken = signal(0);
  readonly modalOpen = signal(false);
  readonly editing = signal<Category | null>(null);
  readonly deleteTarget = signal<Category | null>(null);

  readonly catalogsModal = signal<{
    category: Category;
    items: Catalog[];
    loading: boolean;
  } | null>(null);
  readonly catalogsModalSearch = signal('');
  readonly removingCatalogId = signal<number | null>(null);

  readonly search = signal('');
  readonly page = signal(1);
  readonly sort = signal<'name|asc' | 'name|desc' | 'createdAt|desc' | 'createdAt|asc'>(
    'name|asc',
  );

  readonly viewMode = signal<'card' | 'list'>(
    localStorage.getItem(VIEW_MODE_STORAGE_KEY) === 'list' ? 'list' : 'card',
  );

  readonly columns: AdminTableColumn<Category>[] = [
    {
      key: 'image',
      label: '',
      cell: () => '',
      image: (row) => row.coverImageUrl ?? row.cardImageUrl ?? null,
      imageKind: 'category',
      imageVariant: 'wide',
    },
    { key: 'name', label: 'Nombre', cell: (row) => row.name },
    { key: 'slug', label: 'Slug', cell: (row) => row.slug },
    {
      key: 'catalogs',
      label: 'Catálogos',
      cell: (row) => String(row.catalogsCount ?? 0),
      action: { icon: 'eye', label: 'Ver catálogos' },
    },
  ];

  readonly sortOptions = [
    { value: 'name|asc', label: 'Nombre (A–Z)' },
    { value: 'name|desc', label: 'Nombre (Z–A)' },
    { value: 'createdAt|desc', label: 'Más recientes' },
    { value: 'createdAt|asc', label: 'Más antiguos' },
  ];

  readonly hasActiveFilters = computed(
    () => !!this.search().trim() || this.sort() !== 'name|asc',
  );
  readonly emptyMessage = computed(() =>
    this.hasActiveFilters()
      ? 'No se encontraron categorías con esa búsqueda'
      : 'No hay categorías todavía',
  );

  setViewMode(mode: 'card' | 'list'): void {
    this.viewMode.set(mode);
    localStorage.setItem(VIEW_MODE_STORAGE_KEY, mode);
  }

  readonly filteredModalCatalogs = computed(() => {
    const modal = this.catalogsModal();
    if (!modal) return [];
    const q = this.catalogsModalSearch().trim().toLowerCase();
    if (!q) return modal.items;
    return modal.items.filter((c) => c.name.toLowerCase().includes(q));
  });

  openCatalogs(row: Category): void {
    this.catalogsModalSearch.set('');
    this.catalogsModal.set({ category: row, items: [], loading: true });
    this.catalogsApi.list(1, 100, row.id).subscribe({
      next: (res) => {
        this.catalogsModal.set({ category: row, items: res.data, loading: false });
      },
      error: (err: unknown) => {
        this.catalogsModal.set({ category: row, items: [], loading: false });
        this.toast.error(resolveErrorMessage(err).text);
      },
    });
  }

  closeCatalogsModal(): void {
    this.catalogsModal.set(null);
    this.catalogsModalSearch.set('');
  }

  onCatalogsSearch(value: string): void {
    this.catalogsModalSearch.set(value);
  }

  catalogIsPrincipal(item: Catalog): boolean {
    const categoryId = this.catalogsModal()?.category.id;
    return categoryId !== undefined && item.categoryId === categoryId;
  }

  removeCatalogFromCategory(item: Catalog): void {
    const modal = this.catalogsModal();
    if (!modal) return;
    const isPrincipal = this.catalogIsPrincipal(item);
    const payload: Partial<CatalogWrite> = isPrincipal
      ? { categoryId: null }
      : {
          extraCategoryIds: item.extraCategoryIds.filter(
            (id) => id !== modal.category.id,
          ),
        };
    this.removingCatalogId.set(item.id);
    this.catalogsApi.update(item.id, payload).subscribe({
      next: () => {
        this.removingCatalogId.set(null);
        this.catalogsModal.update((m) =>
          m
            ? { ...m, items: m.items.filter((c) => c.id !== item.id) }
            : m,
        );
        this.toast.success(`«${item.name}» desasignado`);
        this.reload();
      },
      error: (err: unknown) => {
        this.removingCatalogId.set(null);
        this.toast.error(resolveErrorMessage(err).text);
      },
    });
  }

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    description: [''],
    description2: [''],
    coverImageUrl: [''],
    cardImageUrl: [''],
    showCoverImage: [true],
  });

  constructor() {
    const qp = this.route.snapshot.queryParamMap;
    this.search.set(qp.get('q') ?? '');
    const page = qp.get('page');
    if (page) this.page.set(Number(page) || 1);
    const sort = qp.get('sort');
    if (sort && this.isSortValue(sort)) this.sort.set(sort);

    combineLatest([
      toObservable(this.search).pipe(debounceTime(300), distinctUntilChanged()),
      toObservable(this.page),
      toObservable(this.sort),
      toObservable(this.reloadToken),
    ])
      .pipe(
        tap(() => {
          this.loading.set(true);
          this.error.set(null);
          void this.router.navigate([], {
            relativeTo: this.route,
            queryParams: {
              q: this.search().trim() || null,
              page: this.page() > 1 ? this.page() : null,
              sort: this.sort() !== 'name|asc' ? this.sort() : null,
            },
            queryParamsHandling: 'merge',
            replaceUrl: true,
          });
        }),
        switchMap(([search, page, sort]) => {
          const [sortBy, sortDir] = sort.split('|') as ['name' | 'createdAt', 'asc' | 'desc'];
          return this.api.list(page, 20, search.trim() || undefined, sortBy, sortDir).pipe(
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

  private isSortValue(value: string): value is 'name|asc' | 'name|desc' | 'createdAt|desc' | 'createdAt|asc' {
    return ['name|asc', 'name|desc', 'createdAt|desc', 'createdAt|asc'].includes(value);
  }

  onSearchInput(value: string): void {
    this.search.set(value);
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
    this.sort.set('name|asc');
    this.page.set(1);
  }

  reload(): void {
    this.reloadToken.update((n) => n + 1);
  }

  onRetryLoad(): void {
    this.reload();
  }

  openCreate(): void {
    this.editing.set(null);
    this.form.reset({
      name: '',
      description: '',
      description2: '',
      coverImageUrl: '',
      cardImageUrl: '',
      showCoverImage: true,
    });
    this.modalOpen.set(true);
  }

  openEdit(row: Category): void {
    this.editing.set(row);
    this.form.reset({
      name: row.name,
      description: row.description ?? '',
      description2: row.description2 ?? '',
      coverImageUrl: row.coverImageUrl ?? '',
      cardImageUrl: row.cardImageUrl ?? '',
      showCoverImage: row.showCoverImage !== false,
    });
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
  }

  onCoverImageChange(url: string | null): void {
    this.form.controls.coverImageUrl.setValue(url ?? '');
  }

  onCardImageChange(url: string | null): void {
    this.form.controls.cardImageUrl.setValue(url ?? '');
  }

  onDescriptionChange(html: string): void {
    this.form.controls.description.setValue(html);
    this.form.controls.description.markAsDirty();
  }

  onDescription2Change(html: string): void {
    this.form.controls.description2.setValue(html);
    this.form.controls.description2.markAsDirty();
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const body = {
      name: raw.name.trim(),
      description: raw.description.trim() || undefined,
      description2: raw.description2.trim() || undefined,
      coverImageUrl: raw.coverImageUrl.trim() || undefined,
      cardImageUrl: raw.cardImageUrl.trim() || undefined,
      showCoverImage: raw.showCoverImage,
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
        this.toast.success(editing ? 'Categoría actualizada' : 'Categoría creada');
        this.reload();
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.error.set(resolveErrorMessage(err));
      },
    });
  }

  askDelete(row: Category): void {
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
        this.toast.success('Categoría eliminada');
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

  onCellAction(event: { row: Category; key: string }): void {
    if (event.key === 'catalogs') {
      this.openCatalogs(event.row);
    }
  }
}
