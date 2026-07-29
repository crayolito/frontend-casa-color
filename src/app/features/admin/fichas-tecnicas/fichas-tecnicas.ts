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
import { ImageUploader } from '../../../shared/admin-ui/image-uploader/image-uploader';
import { AdminErrorState } from '../../../shared/admin-ui/admin-error-state/admin-error-state';
import { AppSelect, SelectOption } from '../../../shared/ui/select/select';

const MIN_CATEGORIES = 3;
const MAX_CATEGORIES = 4;
const SETTING_KEY = 'fichas_tecnicas';

type CategoryGroup = FormGroup<{
  categoryId: FormControl<number>;
  label: FormControl<string>;
  imageUrl: FormControl<string>;
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
    ImageUploader,
    AdminErrorState,
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

  readonly String = String;

  readonly allCategories = signal<Category[]>([]);
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly flash = signal<string | null>(null);
  readonly error = signal<ResolvedErrorMessage | null>(null);
  readonly expandedCards = signal<Set<string>>(new Set());

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

  get categoriesFA(): FormArray<CategoryGroup> {
    return this.form.controls.categories;
  }

  categoryGroup(index: number): CategoryGroup {
    return this.categoriesFA.at(index);
  }

  cardTitle(index: number): string {
    const label = this.categoriesFA.at(index).value.label?.trim();
    if (label) return label;
    const id = this.categoriesFA.at(index).value.categoryId;
    if (id) {
      return this.allCategories().find((c) => c.id === id)?.name ?? `Categoría ${index + 1}`;
    }
    return `Categoría ${index + 1}`;
  }

  isCardExpanded(key: string): boolean {
    return this.expandedCards().has(key);
  }

  toggleCard(key: string): void {
    this.expandedCards.update((set) => {
      const next = new Set(set);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  ngOnInit(): void {
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
    if (id && !group.value.label?.trim()) {
      const cat = this.allCategories().find((c) => c.id === id);
      if (cat) group.patchValue({ label: cat.name });
    }
  }

  onHeroUploaded(url: string | null): void {
    this.form.controls.heroImageUrl.setValue(url ?? '');
  }

  onCategoryImageUploaded(index: number, url: string | null): void {
    this.categoriesFA.at(index).patchValue({ imageUrl: url ?? '' });
  }

  addCategory(): void {
    if (!this.canAdd()) return;
    this.categoriesFA.push(this.createCategoryGroup());
    this.categoriesVersion.update((n) => n + 1);
  }

  removeCategory(index: number): void {
    if (!this.canRemove()) return;
    this.categoriesFA.removeAt(index);
    this.categoriesVersion.update((n) => n + 1);
  }

  dropCategory(event: CdkDragDrop<CategoryGroup[]>): void {
    moveItemInArray(
      this.categoriesFA.controls,
      event.previousIndex,
      event.currentIndex,
    );
    this.categoriesVersion.update((n) => n + 1);
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.flash.set(null);

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
            this.flash.set(
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
      this.flash.set('Completá título y las categorías (mín. 3, máx. 4).');
      return;
    }

    const raw = this.form.getRawValue();
    const categories = raw.categories
      .filter((c) => c.categoryId > 0 && c.label.trim())
      .map((c) => ({
        categoryId: c.categoryId,
        label: c.label.trim(),
        imageUrl: c.imageUrl.trim() || null,
      }));

    if (categories.length < MIN_CATEGORIES || categories.length > MAX_CATEGORIES) {
      this.flash.set(
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
    this.flash.set(null);
    this.error.set(null);
    this.fichasApi
      .upsert(body)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.flash.set('Fichas técnicas guardadas.');
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
      label: ['', [Validators.required, Validators.maxLength(150)]],
      imageUrl: [''],
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
            { categoryId: 0, label: '', imageUrl: null },
            { categoryId: 0, label: '', imageUrl: null },
            { categoryId: 0, label: '', imageUrl: null },
          ];
    for (const c of seed) {
      const group = this.createCategoryGroup();
      group.patchValue({
        categoryId: c.categoryId ?? 0,
        label: c.label ?? '',
        imageUrl: c.imageUrl ?? '',
      });
      this.categoriesFA.push(group);
    }
    this.categoriesVersion.update((n) => n + 1);
    this.expandedCards.set(new Set());
  }
}
