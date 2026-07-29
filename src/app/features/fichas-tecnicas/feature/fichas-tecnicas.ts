import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, catchError, of, switchMap, tap } from 'rxjs';
import { Container } from '../../../shared/ui/container/container';
import {
  ResolvedErrorMessage,
  resolveErrorMessage,
} from '../../../shared/errors/resolve-error-message';
import { FichasTecnicasPublic } from '../../admin/data/admin.models';
import { FichasTecnicasApi } from '../../admin/data/fichas-tecnicas.api';
import { FichasColumn } from '../ui/fichas-column/fichas-column';
import { ImgFallback } from '../../../shared/util/img-fallback/img-fallback';

@Component({
  selector: 'app-fichas-tecnicas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Container, FichasColumn, ImgFallback],
  templateUrl: './fichas-tecnicas.html',
  styleUrl: './fichas-tecnicas.css',
})
export class FichasTecnicas implements OnInit {
  private readonly api = inject(FichasTecnicasApi);
  private readonly destroyRef = inject(DestroyRef);
  private readonly reload$ = new Subject<void>();

  protected readonly data = signal<FichasTecnicasPublic | null>(null);
  protected readonly selectedId = signal<number | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<ResolvedErrorMessage | null>(null);

  protected readonly heading = computed(
    () => this.data()?.heading?.trim() || 'Fichas Técnicas',
  );
  protected readonly heroImageUrl = computed(
    () => this.data()?.heroImageUrl ?? null,
  );
  protected readonly categories = computed(() => this.data()?.categories ?? []);

  protected readonly selectedCategory = computed(() => {
    const id = this.selectedId();
    const cats = this.categories();
    if (id == null) return cats[0] ?? null;
    return cats.find((c) => c.categoryId === id) ?? cats[0] ?? null;
  });

  constructor() {
    this.reload$
      .pipe(
        tap(() => {
          this.loading.set(true);
          this.error.set(null);
        }),
        switchMap(() =>
          this.api.getPublic().pipe(
            catchError((err: unknown) => {
              this.error.set(resolveErrorMessage(err));
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
          this.data.set(res);
          if (res.categories.length > 0) {
            const current = this.selectedId();
            const stillThere = res.categories.some(
              (c) => c.categoryId === current,
            );
            if (!stillThere) {
              this.selectedId.set(res.categories[0].categoryId);
            }
          } else {
            this.selectedId.set(null);
          }
        },
      });
  }

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.reload$.next();
  }

  protected selectCategory(categoryId: number): void {
    this.selectedId.set(categoryId);
  }
}
