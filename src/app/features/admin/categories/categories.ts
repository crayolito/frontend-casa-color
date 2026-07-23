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
import { Category } from '../data/admin.models';
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

@Component({
  selector: 'app-admin-categories',
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
  ],
  templateUrl: './categories.html',
  styleUrl: './categories.css',
})
export class AdminCategories {
  private readonly api = inject(CategoriesApi);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly destroyRef = inject(DestroyRef);

  readonly rows = signal<Category[]>([]);
  readonly meta = signal<PaginatedMeta | null>(null);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly flash = signal<string | null>(null);
  readonly error = signal<string | null>(null);
  readonly modalOpen = signal(false);
  readonly editing = signal<Category | null>(null);
  readonly deleteTarget = signal<Category | null>(null);

  readonly search = signal('');
  readonly page = signal(1);

  readonly hasActiveFilters = computed(() => !!this.search().trim());
  readonly emptyMessage = computed(() =>
    this.hasActiveFilters()
      ? 'No se encontraron categorías con esa búsqueda'
      : 'No hay categorías todavía',
  );

  readonly columns: AdminTableColumn<Category>[] = [
    { key: 'name', label: 'Nombre', cell: (r) => r.name },
    {
      key: 'short',
      label: 'Descripción corta',
      cell: (r) => r.shortDescription ?? '—',
      truncate: true,
    },
    { key: 'order', label: 'Orden', cell: (r) => String(r.displayOrder) },
    {
      key: 'catalogs',
      label: 'Catálogos',
      cell: (r) => String(r.catalogsCount ?? 0),
    },
  ];

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(150)]],
    shortDescription: ['', [Validators.maxLength(150)]],
    description: [''],
    imageUrl: [''],
    displayOrder: [0, [Validators.min(0)]],
  });

  constructor() {
    const qp = this.route.snapshot.queryParamMap;
    this.search.set(qp.get('q') ?? '');
    const page = qp.get('page');
    if (page) this.page.set(Number(page) || 1);

    combineLatest([
      toObservable(this.search).pipe(debounceTime(300), distinctUntilChanged()),
      toObservable(this.page),
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
            },
            queryParamsHandling: 'merge',
            replaceUrl: true,
          });
        }),
        switchMap(([search, page]) =>
          this.api.list(page, 20, search.trim() || undefined).pipe(
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

  onSearchInput(value: string): void {
    this.search.set(value);
    this.page.set(1);
  }

  clearFilters(): void {
    this.search.set('');
    this.page.set(1);
  }

  reload(): void {
    this.api.list(this.page(), 20, this.search().trim() || undefined).subscribe({
      next: (res) => {
        this.rows.set(res.data);
        this.meta.set(res.meta);
      },
    });
  }

  openCreate(): void {
    this.editing.set(null);
    this.form.reset({
      name: '',
      shortDescription: '',
      description: '',
      imageUrl: '',
      displayOrder: 0,
    });
    this.modalOpen.set(true);
  }

  openEdit(row: Category): void {
    this.editing.set(row);
    this.form.reset({
      name: row.name,
      shortDescription: row.shortDescription ?? '',
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
      name: raw.name.trim(),
      shortDescription: raw.shortDescription.trim() || undefined,
      description: raw.description.trim() || undefined,
      imageUrl: raw.imageUrl.trim() || undefined,
      displayOrder: Number(raw.displayOrder) || 0,
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
        this.flash.set(editing ? 'Categoría actualizada' : 'Categoría creada');
        this.reload();
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.error.set(isAppError(err) ? err.message : 'Error al guardar');
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
        this.flash.set('Categoría eliminada');
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
