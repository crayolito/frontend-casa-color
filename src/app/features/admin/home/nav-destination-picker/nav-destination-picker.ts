import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  inject,
  input,
  output,
  signal,
  computed,
} from '@angular/core';
import { CategoriesApi } from '../../data/categories.api';
import { CatalogsApi } from '../../data/catalogs.api';
import { Category, Catalog } from '../../data/admin.models';
import {
  HOME_PAGE_OPTIONS,
  HomeNavDestination,
  HomeNavDestinationType,
} from '../../../home/data/home-content.model';
import { AppSelect, SelectOption } from '../../../../shared/ui/select/select';

@Component({
  selector: 'app-nav-destination-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AppSelect],
  template: `
    <div class="nav-dest">
      <label class="nav-dest__label">Tipo de destino</label>
      <app-select
        [options]="typeOptions"
        [value]="type()"
        placeholder="Sin destino"
        (valueChange)="onTypeChange($event)"
      />

      @if (type() === 'category') {
        <label class="nav-dest__label">Categoría</label>
        <app-select
          [options]="categoryOptions()"
          [value]="selectedSlug()"
          placeholder="— Seleccioná —"
          (valueChange)="onCategoryChange($event)"
        />
      }

      @if (type() === 'catalog') {
        <label class="nav-dest__label">Catálogo</label>
        <app-select
          [options]="catalogOptions()"
          [value]="selectedSlug()"
          placeholder="— Seleccioná —"
          (valueChange)="onCatalogChange($event)"
        />
      }

      @if (type() === 'page') {
        <label class="nav-dest__label">Página</label>
        <app-select
          [options]="pageOptions"
          [value]="selectedSlug()"
          placeholder="— Seleccioná —"
          (valueChange)="onPageChange($event)"
        />
      }
    </div>
  `,
  styles: `
    .nav-dest {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .nav-dest__label {
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--color-text);
    }
  `,
})
export class NavDestinationPicker implements OnInit {
  private readonly categoriesApi = inject(CategoriesApi);
  private readonly catalogsApi = inject(CatalogsApi);

  readonly value = input<HomeNavDestination | null>(null);
  readonly valueChange = output<HomeNavDestination | null>();

  protected readonly type = signal<HomeNavDestinationType | ''>('');
  protected readonly selectedSlug = signal('');
  protected readonly categories = signal<Category[]>([]);
  protected readonly catalogs = signal<Catalog[]>([]);
  protected readonly pages = HOME_PAGE_OPTIONS;

  protected readonly typeOptions: SelectOption[] = [
    { value: '', label: 'Sin destino' },
    { value: 'category', label: 'Categoría' },
    { value: 'catalog', label: 'Catálogo (colección)' },
    { value: 'page', label: 'Página fija' },
  ];

  protected readonly pageOptions: SelectOption[] = HOME_PAGE_OPTIONS.map(
    (p) => ({ value: p.value, label: p.label }),
  );

  protected readonly categoryOptions = computed((): SelectOption[] => [
    { value: '', label: '— Seleccioná —' },
    ...this.categories().map((c) => ({ value: c.slug, label: c.name })),
  ]);

  protected readonly catalogOptions = computed((): SelectOption[] => [
    { value: '', label: '— Seleccioná —' },
    ...this.catalogs().map((c) => ({ value: c.slug, label: c.name })),
  ]);

  ngOnInit(): void {
    const v = this.value();
    if (v) {
      this.type.set(v.type);
      this.selectedSlug.set(v.slug ?? '');
    }
    this.categoriesApi.list(1, 100).subscribe({
      next: (res) => this.categories.set(res.data),
    });
    this.catalogsApi.list(1, 100).subscribe({
      next: (res) => this.catalogs.set(res.data),
    });
  }

  protected onTypeChange(next: string | number | null): void {
    const t = (next ?? '') as HomeNavDestinationType | '';
    this.type.set(t);
    this.selectedSlug.set('');
    this.valueChange.emit(null);
  }

  protected onCategoryChange(raw: string | number | null): void {
    const slug = String(raw ?? '');
    this.selectedSlug.set(slug);
    const cat = this.categories().find((c) => c.slug === slug);
    if (!cat) {
      this.valueChange.emit(null);
      return;
    }
    this.valueChange.emit({ type: 'category', slug: cat.slug, name: cat.name });
  }

  protected onCatalogChange(raw: string | number | null): void {
    const slug = String(raw ?? '');
    this.selectedSlug.set(slug);
    const cat = this.catalogs().find((c) => c.slug === slug);
    if (!cat) {
      this.valueChange.emit(null);
      return;
    }
    this.valueChange.emit({ type: 'catalog', slug: cat.slug, name: cat.name });
  }

  protected onPageChange(raw: string | number | null): void {
    const slug = String(raw ?? '');
    this.selectedSlug.set(slug);
    const page = this.pages.find((p) => p.value === slug);
    if (!page) {
      this.valueChange.emit(null);
      return;
    }
    this.valueChange.emit({ type: 'page', slug: page.value, name: page.label });
  }
}
