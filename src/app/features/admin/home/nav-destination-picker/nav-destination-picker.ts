import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CategoriesApi } from '../../data/categories.api';
import { CatalogsApi } from '../../data/catalogs.api';
import { Category, Catalog } from '../../data/admin.models';
import {
  HOME_PAGE_OPTIONS,
  HomeNavDestination,
  HomeNavDestinationType,
} from '../../../home/data/home-content.model';

@Component({
  selector: 'app-nav-destination-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div class="nav-dest">
      <label class="nav-dest__label">Tipo de destino</label>
      <select
        class="nav-dest__select"
        [ngModel]="type()"
        (ngModelChange)="onTypeChange($event)"
      >
        <option value="">Sin destino</option>
        <option value="category">Categoría</option>
        <option value="catalog">Catálogo (colección)</option>
        <option value="page">Página fija</option>
      </select>

      @if (type() === 'category') {
        <label class="nav-dest__label">Categoría</label>
        <select
          class="nav-dest__select"
          [ngModel]="selectedSlug()"
          (ngModelChange)="onCategoryChange($event)"
        >
          <option value="">— Seleccioná —</option>
          @for (c of categories(); track c.id) {
            <option [value]="c.slug">{{ c.name }}</option>
          }
        </select>
      }

      @if (type() === 'catalog') {
        <label class="nav-dest__label">Catálogo</label>
        <select
          class="nav-dest__select"
          [ngModel]="selectedSlug()"
          (ngModelChange)="onCatalogChange($event)"
        >
          <option value="">— Seleccioná —</option>
          @for (c of catalogs(); track c.id) {
            <option [value]="c.slug">{{ c.name }}</option>
          }
        </select>
      }

      @if (type() === 'page') {
        <label class="nav-dest__label">Página</label>
        <select
          class="nav-dest__select"
          [ngModel]="selectedSlug()"
          (ngModelChange)="onPageChange($event)"
        >
          <option value="">— Seleccioná —</option>
          @for (p of pages; track p.value) {
            <option [value]="p.value">{{ p.label }}</option>
          }
        </select>
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
    .nav-dest__select {
      width: 100%;
      min-height: 38px;
      padding: 0.4rem 0.75rem;
      border: 1px solid var(--admin-border);
      border-radius: var(--radius-md);
      font: inherit;
      background: var(--color-white);
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

  protected onTypeChange(next: HomeNavDestinationType | ''): void {
    this.type.set(next);
    this.selectedSlug.set('');
    this.valueChange.emit(null);
  }

  protected onCategoryChange(slug: string): void {
    this.selectedSlug.set(slug);
    const cat = this.categories().find((c) => c.slug === slug);
    if (!cat) {
      this.valueChange.emit(null);
      return;
    }
    this.valueChange.emit({ type: 'category', slug: cat.slug, name: cat.name });
  }

  protected onCatalogChange(slug: string): void {
    this.selectedSlug.set(slug);
    const cat = this.catalogs().find((c) => c.slug === slug);
    if (!cat) {
      this.valueChange.emit(null);
      return;
    }
    this.valueChange.emit({ type: 'catalog', slug: cat.slug, name: cat.name });
  }

  protected onPageChange(slug: string): void {
    this.selectedSlug.set(slug);
    const page = this.pages.find((p) => p.value === slug);
    if (!page) {
      this.valueChange.emit(null);
      return;
    }
    this.valueChange.emit({ type: 'page', slug: page.value, name: page.label });
  }
}
