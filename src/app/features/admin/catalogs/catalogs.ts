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
import { Catalog, Category } from '../data/admin.models';
import { PaginatedMeta } from '../../../core/http/api.service';
import { isAppError } from '../../../shared/util/api-errors';
import { AdminPageHeader } from '../../../shared/admin-ui/admin-page-header/admin-page-header';
import { AdminButton } from '../../../shared/admin-ui/admin-button/admin-button';
import {
  AdminTable,
  AdminTableColumn,
} from '../../../shared/admin-ui/admin-table/admin-table';
import { AdminModal } from '../../../shared/admin-ui/admin-modal/admin-modal';
import { AdminFormField } from '../../../shared/admin-ui/admin-form-field/admin-form-field';
import { AdminConfirmDialog } from '../../../shared/admin-ui/admin-confirm-dialog/admin-confirm-dialog';
import { AdminFilters } from '../../../shared/admin-ui/admin-filters/admin-filters';
import { AdminIcon } from '../../../shared/admin-ui/icons/admin-icon';
import { ImageUploader } from '../../../shared/admin-ui/image-uploader/image-uploader';
import { AdminMultiSelect } from '../../../shared/admin-ui/admin-multi-select/admin-multi-select';

@Component({
  selector: 'app-admin-catalogs',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    AdminPageHeader,
    AdminButton,
    AdminTable,
    AdminModal,
    AdminFormField,
    AdminConfirmDialog,
    AdminFilters,
    AdminIcon,
    ImageUploader,
    AdminMultiSelect,
  ],
  templateUrl: './catalogs.html',
  styleUrl: './catalogs.css',
})
export class AdminCatalogs {
  private readonly api = inject(CatalogsApi);
  private readonly categoriesApi = inject(CategoriesApi);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly rows = signal<Catalog[]>([]);
  readonly categories = signal<Category[]>([]);
  readonly meta = signal<PaginatedMeta | null>(null);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly flash = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  readonly modalOpen = signal(false);
  readonly editing = signal<Catalog | null>(null);
  readonly deleteTarget = signal<Catalog | null>(null);
  readonly extraCategoryIds = signal<number[]>([]);

  readonly search = signal('');
  readonly categoryId = signal<number | null>(null);
  readonly page = signal(1);

  readonly hasActiveFilters = computed(
    () => !!this.search().trim() || this.categoryId() !== null,
  );
  readonly emptyMessage = computed(() =>
    this.hasActiveFilters()
      ? 'No se encontraron catálogos con esos filtros'
      : 'No hay catálogos todavía',
  );

  readonly categoryOptions = computed(() =>
    this.categories().map((c) => ({ id: c.id, label: c.name })),
  );

  /** Exposed for template Number() casts. */
  readonly Number = Number;

  readonly columns: AdminTableColumn<Catalog>[] = [
    { key: 'name', label: 'Nombre', cell: (r) => r.name },
    {
      key: 'categories',
      label: 'Categorías',
      cell: (r) => this.formatCategories(r),
      truncate: true,
    },
    { key: 'order', label: 'Orden', cell: (r) => String(r.displayOrder) },
  ];

  readonly form = this.fb.nonNullable.group({
    categoryId: [0, [Validators.required, Validators.min(1)]],
    name: ['', [Validators.required, Validators.maxLength(150)]],
    description: [''],
    imageUrl: [''],
    displayOrder: [0, [Validators.min(0)]],
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

    combineLatest([
      toObservable(this.search).pipe(debounceTime(300), distinctUntilChanged()),
      toObservable(this.categoryId),
      toObservable(this.page),
    ])
      .pipe(
        tap(() => {
          this.loading.set(true);
          this.error.set(null);
          this.syncUrl();
        }),
        switchMap(([search, categoryId, page]) =>
          this.api
            .list(page, 20, categoryId ?? undefined, search.trim() || undefined)
            .pipe(
              catchError((err: unknown) => {
                this.error.set(isAppError(err) ? err.message : 'Error al cargar');
                return of(null);
              }),
            ),
        ),
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

  formatCategories(row: Catalog): string {
    const principal = this.categoryName(row.categoryId);
    const extras = (row.extraCategories ?? []).map((c) => c.name);
    if (!extras.length) return principal;
    return `${principal} · ${extras.join(', ')}`;
  }

  categoryName(id: number): string {
    return this.categories().find((c) => c.id === id)?.name ?? String(id);
  }

  private syncUrl(): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        q: this.search().trim() || null,
        categoryId: this.categoryId(),
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
    this.page.set(1);
  }

  clearFilters(): void {
    this.search.set('');
    this.categoryId.set(null);
    this.page.set(1);
  }

  reload(): void {
    this.api
      .list(
        this.page(),
        20,
        this.categoryId() ?? undefined,
        this.search().trim() || undefined,
      )
      .subscribe({
        next: (res) => {
          this.rows.set(res.data);
          this.meta.set(res.meta);
        },
      });
  }

  openCreate(): void {
    this.editing.set(null);
    const firstCat = this.categories()[0]?.id ?? 0;
    this.extraCategoryIds.set([]);
    this.form.reset({
      categoryId: firstCat,
      name: '',
      description: '',
      imageUrl: '',
      displayOrder: 0,
    });
    this.modalOpen.set(true);
  }

  openEdit(row: Catalog): void {
    this.editing.set(row);
    this.extraCategoryIds.set(row.extraCategoryIds ?? []);
    this.form.reset({
      categoryId: row.categoryId,
      name: row.name,
      description: row.description ?? '',
      imageUrl: row.imageUrl ?? '',
      displayOrder: row.displayOrder,
    });
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
  }

  onImageChange(url: string | null): void {
    this.form.controls.imageUrl.setValue(url ?? '');
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const raw = this.form.getRawValue();
    const body = {
      categoryId: Number(raw.categoryId),
      name: raw.name.trim(),
      description: raw.description.trim() || undefined,
      imageUrl: raw.imageUrl.trim() || undefined,
      displayOrder: Number(raw.displayOrder) || 0,
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
        this.flash.set(editing ? 'Catálogo actualizado' : 'Catálogo creado');
        this.reload();
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.error.set(isAppError(err) ? err.message : 'Error al guardar');
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
        this.flash.set('Catálogo eliminado');
        this.reload();
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
