import {
  Component,
  ChangeDetectionStrategy,
  DestroyRef,
  HostListener,
  inject,
  output,
  signal,
  computed,
} from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { catchError, debounceTime, distinctUntilChanged, of, switchMap, tap } from 'rxjs';
import { AuthService } from '../../../../core/auth/auth.service';
import { AdminButton } from '../../../../shared/admin-ui/admin-button/admin-button';
import { AdminIcon } from '../../../../shared/admin-ui/icons/admin-icon';
import { AdminFormContext } from '../../../../shared/admin-ui/admin-form-context/admin-form-context';
import {
  AdminSearchApi,
  AdminSearchResult,
} from '../../data/admin-search.api';

const COMMANDS = [
  { label: 'Productos', path: '/admin/products', hint: 'Listado' },
  { label: 'Nuevo producto', path: '/admin/products/new', hint: 'Crear' },
  { label: 'Categorías', path: '/admin/categories', hint: 'Listado' },
  { label: 'Catálogos', path: '/admin/catalogs', hint: 'Listado' },
  { label: 'Inicio', path: '/admin/home', hint: 'Inicio' },
  { label: 'Datos del sitio', path: '/admin/settings', hint: 'Ajustes' },
];

const EMPTY_RESULTS: AdminSearchResult = {
  products: [],
  catalogs: [],
  categories: [],
};

@Component({
  selector: 'app-admin-topbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AdminButton, AdminIcon],
  templateUrl: './admin-topbar.html',
  styleUrl: './admin-topbar.css',
})
export class AdminTopbar {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly searchApi = inject(AdminSearchApi);
  private readonly destroyRef = inject(DestroyRef);
  readonly formCtx = inject(AdminFormContext);

  readonly menuToggle = output<void>();
  readonly collapseToggle = output<void>();

  readonly searchOpen = signal(false);
  readonly searchQuery = signal('');
  readonly searchLoading = signal(false);
  readonly serverResults = signal<AdminSearchResult>(EMPTY_RESULTS);

  readonly filteredCommands = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return COMMANDS;
    return COMMANDS.filter(
      (c) => c.label.toLowerCase().includes(q) || c.hint.toLowerCase().includes(q),
    );
  });

  readonly hasServerQuery = computed(() => this.searchQuery().trim().length >= 2);

  readonly hasAnyResults = computed(() => {
    if (this.filteredCommands().length > 0) return true;
    if (!this.hasServerQuery()) return false;
    const r = this.serverResults();
    return r.products.length + r.catalogs.length + r.categories.length > 0;
  });

  constructor() {
    toObservable(this.searchQuery)
      .pipe(
        debounceTime(200),
        distinctUntilChanged(),
        tap((q) => {
          const term = q.trim();
          if (term.length < 2) {
            this.serverResults.set(EMPTY_RESULTS);
            this.searchLoading.set(false);
          } else {
            this.searchLoading.set(true);
          }
        }),
        switchMap((q) => {
          const term = q.trim();
          if (term.length < 2) return of(EMPTY_RESULTS);
          return this.searchApi.search(term).pipe(
            catchError(() => of(EMPTY_RESULTS)),
          );
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((results) => {
        this.searchLoading.set(false);
        this.serverResults.set(results);
      });
  }

  @HostListener('document:keydown', ['$event'])
  onKeydown(event: KeyboardEvent): void {
    if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      if (this.formCtx.dirty()) return;
      this.searchOpen.update((v) => !v);
      if (this.searchOpen()) this.resetSearch();
    }
    if (event.key === 'Escape' && this.searchOpen()) {
      this.searchOpen.set(false);
    }
  }

  openSearch(): void {
    this.searchOpen.set(true);
    this.resetSearch();
  }

  closeSearch(): void {
    this.searchOpen.set(false);
  }

  private resetSearch(): void {
    this.searchQuery.set('');
    this.serverResults.set(EMPTY_RESULTS);
    this.searchLoading.set(false);
  }

  goTo(path: string): void {
    this.searchOpen.set(false);
    void this.router.navigateByUrl(path);
  }

  goToProduct(id: number): void {
    this.goTo(`/admin/products/${id}/edit`);
  }

  goToCatalog(slug: string): void {
    this.searchOpen.set(false);
    void this.router.navigate(['/admin/catalogs'], {
      queryParams: { q: slug },
    });
  }

  goToCategory(slug: string): void {
    this.searchOpen.set(false);
    void this.router.navigate(['/admin/categories'], {
      queryParams: { q: slug },
    });
  }

  logout(): void {
    this.auth.logout();
  }
}
