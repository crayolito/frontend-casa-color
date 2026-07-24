import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CategoriesApi } from '../../data/categories.api';
import { CatalogsApi } from '../../data/catalogs.api';
import { ProductsApi } from '../../data/products.api';
import { Category, Catalog, Product } from '../../data/admin.models';
import {
  HomeDestination,
  HomeDestinationType,
} from '../../../home/data/home-content.model';

interface PickItem {
  id: number;
  slug: string;
  name: string;
}

@Component({
  selector: 'app-destination-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div class="dest">
      <label class="dest__label" [attr.for]="typeId">Destino del botón</label>
      <select
        class="dest__select"
        [id]="typeId"
        [ngModel]="type()"
        (ngModelChange)="onTypeChange($event)"
      >
        <option value="">Sin botón / sin destino</option>
        <option value="category">Categoría</option>
        <option value="catalog">Catálogo (colección)</option>
        <option value="product">Producto</option>
      </select>

      @if (type()) {
        <label class="dest__label" [attr.for]="itemId">Elegí uno</label>
        <select
          class="dest__select"
          [id]="itemId"
          [ngModel]="selectedId()"
          (ngModelChange)="onItemChange($event)"
        >
          <option [ngValue]="null">— Seleccioná —</option>
          @for (item of items(); track item.id) {
            <option [ngValue]="item.id">{{ item.name }}</option>
          }
        </select>
      }
    </div>
  `,
  styles: `
    .dest {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .dest__label {
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--color-text);
    }
    .dest__select {
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
export class DestinationPicker implements OnInit {
  private readonly categoriesApi = inject(CategoriesApi);
  private readonly catalogsApi = inject(CatalogsApi);
  private readonly productsApi = inject(ProductsApi);

  readonly value = input<HomeDestination | null>(null);
  readonly valueChange = output<HomeDestination | null>();

  protected readonly type = signal<HomeDestinationType | ''>('');
  protected readonly selectedId = signal<number | null>(null);
  protected readonly categories = signal<Category[]>([]);
  protected readonly catalogs = signal<Catalog[]>([]);
  protected readonly products = signal<Product[]>([]);

  protected readonly typeId = `dest-type-${Math.random().toString(36).slice(2, 8)}`;
  protected readonly itemId = `dest-item-${Math.random().toString(36).slice(2, 8)}`;

  protected readonly items = computed((): PickItem[] => {
    const t = this.type();
    if (t === 'category') {
      return this.categories().map((c) => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
      }));
    }
    if (t === 'catalog') {
      return this.catalogs().map((c) => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
      }));
    }
    if (t === 'product') {
      return this.products().map((p) => ({
        id: p.id,
        slug: p.slug,
        name: p.title,
      }));
    }
    return [];
  });

  ngOnInit(): void {
    const v = this.value();
    if (v) {
      this.type.set(v.type);
      this.selectedId.set(v.id);
    }
    this.categoriesApi.list(1, 100).subscribe({
      next: (res) => this.categories.set(res.data),
    });
    this.catalogsApi.list(1, 100).subscribe({
      next: (res) => this.catalogs.set(res.data),
    });
    this.productsApi.listPublic({ page: 1, limit: 100 }).subscribe({
      next: (res) => this.products.set(res.data),
    });
  }

  protected onTypeChange(next: HomeDestinationType | ''): void {
    this.type.set(next);
    this.selectedId.set(null);
    this.valueChange.emit(null);
  }

  protected onItemChange(id: number | null): void {
    this.selectedId.set(id);
    const t = this.type();
    if (!t || id == null) {
      this.valueChange.emit(null);
      return;
    }
    const item = this.items().find((i) => i.id === id);
    if (!item) {
      this.valueChange.emit(null);
      return;
    }
    this.valueChange.emit({
      type: t,
      id: item.id,
      slug: item.slug,
      name: item.name,
    });
  }
}
