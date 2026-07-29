import { A11yModule } from '@angular/cdk/a11y';
import {
  Component,
  computed,
  inject,
  input,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { CatalogsApi } from '../../../features/admin/data/catalogs.api';
import { Catalog } from '../../../features/admin/data/admin.models';
import { HomeResolvedCategory } from '../../../features/home/data/home-content.model';

export interface SearchSuggestion {
  kind: 'category' | 'catalog';
  id: number;
  label: string;
  href: string;
}

@Component({
  selector: 'app-search-overlay',
  imports: [A11yModule, RouterLink],
  templateUrl: './search-overlay.html',
  styleUrl: './search-overlay.css',
})
export class SearchOverlay implements OnInit {
  private readonly catalogsApi = inject(CatalogsApi);
  private readonly router = inject(Router);

  readonly categories = input<HomeResolvedCategory[]>([]);
  readonly closed = output<void>();

  protected readonly query = signal('');
  protected readonly catalogs = signal<Catalog[]>([]);

  protected readonly suggestions = computed(() => {
    const q = this.query().trim().toLowerCase();
    if (!q) {
      return [] as SearchSuggestion[];
    }
    const fromCats: SearchSuggestion[] = this.categories()
      .filter((c) => c.name.toLowerCase().includes(q) && c.slug?.trim())
      .map((c) => ({
        kind: 'category' as const,
        id: c.categoryId,
        label: c.name,
        href: `/categoria/${c.slug}`,
      }));
    const fromCatalogs: SearchSuggestion[] = this.catalogs()
      .filter((c) => c.name.toLowerCase().includes(q) && c.slug?.trim())
      .map((c) => ({
        kind: 'catalog' as const,
        id: c.id,
        label: c.name,
        href: `/catalogo/${c.slug}`,
      }));
    return [...fromCats, ...fromCatalogs].slice(0, 12);
  });

  ngOnInit(): void {
    this.catalogsApi.list(1, 100).subscribe({
      next: (res) => this.catalogs.set(res.data),
    });
  }

  protected close(): void {
    this.closed.emit();
  }

  protected onQueryInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.query.set(target.value);
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
    const q = this.query().trim();
    if (!q) return;
    this.close();
    void this.router.navigate(['/search'], { queryParams: { q } });
  }

  protected kindLabel(kind: SearchSuggestion['kind']): string {
    return kind === 'category' ? 'Categoría' : 'Catálogo';
  }
}
