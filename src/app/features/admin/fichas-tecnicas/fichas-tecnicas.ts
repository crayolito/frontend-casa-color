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
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { forkJoin, of } from 'rxjs';
import { catchError } from 'rxjs';
import { CategoriesApi } from '../data/categories.api';
import { FichasTecnicasApi } from '../data/fichas-tecnicas.api';
import { SiteSettingsApi } from '../data/site-settings.api';
import { Category, FichasTecnicasSettings } from '../data/admin.models';
import { isAppError } from '../../../shared/util/api-errors';
import {
  ResolvedErrorMessage,
  resolveErrorMessage,
} from '../../../shared/errors/resolve-error-message';
import { AdminPageHeader } from '../../../shared/admin-ui/admin-page-header/admin-page-header';
import { AdminButton } from '../../../shared/admin-ui/admin-button/admin-button';
import { AdminFormField } from '../../../shared/admin-ui/admin-form-field/admin-form-field';
import { AdminIcon } from '../../../shared/admin-ui/icons/admin-icon';
import { AdminIconButton } from '../../../shared/admin-ui/admin-icon-button/admin-icon-button';
import { ImageUploader } from '../../../shared/admin-ui/image-uploader/image-uploader';
import { AdminErrorState } from '../../../shared/admin-ui/admin-error-state/admin-error-state';
import { AdminModal } from '../../../shared/admin-ui/admin-modal/admin-modal';
import { AppSelect, SelectOption } from '../../../shared/ui/select/select';
import { AdminFormContext } from '../../../shared/admin-ui/admin-form-context/admin-form-context';
import { AdminToastService } from '../../../shared/admin-ui/admin-toast/admin-toast.service';

const MIN_CATEGORIES = 3;
const MAX_CATEGORIES = 4;
const SETTING_KEY = 'fichas_tecnicas';

type CategoryGroup = FormGroup<{
  categoryId: FormControl<number>;
}>;

@Component({
  selector: 'app-admin-fichas-tecnicas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    DragDropModule,
    AdminPageHeader,
    AdminButton,
    AdminFormField,
    AdminIcon,
    AdminIconButton,
    ImageUploader,
    AdminErrorState,
    AdminModal,
    AppSelect,
  ],
  templateUrl: './fichas-tecnicas.html',
  styleUrl: './fichas-tecnicas.css',
})
export class AdminFichasTecnicas implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly fichasApi = inject(FichasTecnicasApi);
  private readonly settingsApi = inject(SiteSettingsApi);
  private readonly categoriesApi = inject(CategoriesApi);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toast = inject(AdminToastService);
  private readonly formCtx = inject(AdminFormContext);

  readonly String = String;

  readonly allCategories = signal<Category[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<ResolvedErrorMessage | null>(null);
  readonly categoryModalOpen = signal(false);
  readonly categoryEditIndex = signal<number | null>(null);

  private readonly _dirtyTick = signal(0);

  readonly form = this.fb.nonNullable.group({
    heading: ['Fichas Técnicas', [Validators.required, Validators.maxLength(200)]],
    heroImageUrl: [''],
    categories: this.fb.array([
      this.createCategoryGroup(),
      this.createCategoryGroup(),
      this.createCategoryGroup(),
    ]),
  });

  readonly categoriesVersion = signal(0);
  readonly categoryCount = computed(() => {
    this.categoriesVersion();
    return this.categoriesFA.length;
  });
  readonly canAdd = computed(() => this.categoryCount() < MAX_CATEGORIES);
  readonly canRemove = computed(() => this.categoryCount() > MIN_CATEGORIES);
  readonly formDirty = computed(() => {
    this._dirtyTick();
    return this.form.dirty;
  });

  get categoriesFA(): FormArray<CategoryGroup> {
    return this.form.controls.categories;
  }

  categoryGroup(index: number): CategoryGroup {
    return this.categoriesFA.at(index);
  }

  cardTitle(index: number): string {
    const id = this.categoriesFA.at(index).value.categoryId;
    if (id) {
      return (
        this.allCategories().find((c) => c.id === id)?.name ??
        `Categoría ${index + 1}`
      );
    }
    return `Categoría ${index + 1}`;
  }

  categoryModalTitle(): string {
    const idx = this.categoryEditIndex();
    if (idx === null) return 'Categoría';
    return this.cardTitle(idx);
  }

  openEditCategory(index: number): void {
    this.categoryEditIndex.set(index);
    this.categoryModalOpen.set(true);
  }

  closeCategoryModal(): void {
    this.categoryModalOpen.set(false);
    this.categoryEditIndex.set(null);
  }

  ngOnInit(): void {
    this.formCtx.register(
      {
        dirty: this.formDirty,
        saving: this.saving,
        save: () => this.save(),
        discard: () => this.discardChanges(),
      },
      this.destroyRef,
    );
    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this._dirtyTick.update((n) => n + 1));
    this.load();
  }

  discardChanges(): void {
    this.load();
  }

  categoryOptions(index: number): SelectOption[] {
    const selectedElsewhere = new Set(
      this.categoriesFA.controls
        .map((c, i) => (i === index ? null : Number(c.value.categoryId)))
        .filter((id): id is number => !!id && !Number.isNaN(id)),
    );
    return this.allCategories()
      .filter((c) => !selectedElsewhere.has(c.id))
      .map((c) => ({ value: String(c.id), label: c.name }));
  }

  onCategorySelect(index: number, value: string | number | null): void {
    const group = this.categoriesFA.at(index);
    const id = value === null || value === '' ? 0 : Number(value);
    group.patchValue({ categoryId: id });
    group.markAsDirty();
    this.form.markAsDirty();
  }

  onHeroUploaded(url: string | null): void {
    this.form.controls.heroImageUrl.setValue(url ?? '');
    this.form.controls.heroImageUrl.markAsDirty();
  }

  addCategory(): void {
    if (!this.canAdd()) return;
    const idx = this.categoriesFA.length;
    this.categoriesFA.push(this.createCategoryGroup());
    this.categoriesVersion.update((n) => n + 1);
    this.form.markAsDirty();
    this._dirtyTick.update((n) => n + 1);
    this.openEditCategory(idx);
  }

  removeCategory(index: number): void {
    if (!this.canRemove()) return;
    if (this.categoryEditIndex() === index) this.closeCategoryModal();
    this.categoriesFA.removeAt(index);
    this.categoriesVersion.update((n) => n + 1);
    this.form.markAsDirty();
    this._dirtyTick.update((n) => n + 1);
  }

  dropCategory(event: CdkDragDrop<CategoryGroup[]>): void {
    moveItemInArray(
      this.categoriesFA.controls,
      event.previousIndex,
      event.currentIndex,
    );
    this.categoriesVersion.update((n) => n + 1);
    this.form.markAsDirty();
    this._dirtyTick.update((n) => n + 1);
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);

    forkJoin({
      categories: this.categoriesApi.list(1, 100),
      setting: this.settingsApi.get(SETTING_KEY).pipe(
        catchError((err: unknown) => {
          if (isAppError(err) && err.status === 404) {
            return of(null);
          }
          throw err;
        }),
      ),
    })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ categories, setting }) => {
          this.loading.set(false);
          this.allCategories.set(categories.data);
          this.applySettings(
            setting?.value
              ? (setting.value as unknown as FichasTecnicasSettings)
              : null,
          );
          if (!setting) {
            this.toast.info(
              'Todavía no hay configuración. Elegí 3 o 4 categorías y guardá.',
            );
          }
        },
        error: (err: unknown) => {
          this.loading.set(false);
          this.error.set(resolveErrorMessage(err));
        },
      });
  }

  save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.toast.error('Completá título y elegí las categorías (mín. 3, máx. 4).');
      return;
    }

    const raw = this.form.getRawValue();
    const byId = new Map(this.allCategories().map((c) => [c.id, c]));
    const categories = raw.categories
      .filter((c) => c.categoryId > 0)
      .map((c) => {
        const cat = byId.get(c.categoryId);
        return {
          categoryId: c.categoryId,
          label: cat?.name ?? '',
          imageUrl: cat?.cardImageUrl?.trim() || null,
        };
      })
      .filter((c) => c.label);

    if (categories.length < MIN_CATEGORIES || categories.length > MAX_CATEGORIES) {
      this.toast.error(
        `Debés configurar entre ${MIN_CATEGORIES} y ${MAX_CATEGORIES} categorías.`,
      );
      return;
    }

    const body: FichasTecnicasSettings = {
      heading: raw.heading.trim(),
      heroImageUrl: raw.heroImageUrl.trim() || null,
      categories,
    };

    this.saving.set(true);
    this.error.set(null);
    this.fichasApi
      .upsert(body)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.toast.success('Fichas técnicas guardadas.');
          this.form.markAsPristine();
          this._dirtyTick.update((n) => n + 1);
        },
        error: (err: unknown) => {
          this.saving.set(false);
          this.error.set(resolveErrorMessage(err));
        },
      });
  }

  private createCategoryGroup(): CategoryGroup {
    return this.fb.nonNullable.group({
      categoryId: [0, [Validators.required, Validators.min(1)]],
    });
  }

  private applySettings(value: FichasTecnicasSettings | null): void {
    this.form.controls.heading.setValue(value?.heading?.trim() || 'Fichas Técnicas');
    this.form.controls.heroImageUrl.setValue(value?.heroImageUrl ?? '');

    const cats = value?.categories ?? [];
    while (this.categoriesFA.length > 0) {
      this.categoriesFA.removeAt(0);
    }
    const seed =
      cats.length >= MIN_CATEGORIES
        ? cats.slice(0, MAX_CATEGORIES)
        : [
            { categoryId: 0 },
            { categoryId: 0 },
            { categoryId: 0 },
          ];
    for (const c of seed) {
      const group = this.createCategoryGroup();
      group.patchValue({ categoryId: c.categoryId ?? 0 });
      this.categoriesFA.push(group);
    }
    this.categoriesVersion.update((n) => n + 1);
    this.closeCategoryModal();
    this.form.markAsPristine();
    this._dirtyTick.update((n) => n + 1);
  }
}
