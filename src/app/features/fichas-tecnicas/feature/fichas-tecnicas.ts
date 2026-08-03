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
import { withBannerFallback } from '../../../shared/util/default-images';

@Component({
  selector: 'app-fichas-tecnicas',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Container, FichasColumn],
  templateUrl: './fichas-tecnicas.html',
  styleUrl: './fichas-tecnicas.css',
})
export class FichasTecnicas implements OnInit {
  private readonly api = inject(FichasTecnicasApi);
  private readonly destroyRef = inject(DestroyRef);
  private readonly reload$ = new Subject<void>();

  protected readonly data = signal<FichasTecnicasPublic | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<ResolvedErrorMessage | null>(null);

  protected readonly heading = computed(
    () => this.data()?.heading?.trim() || 'Fichas Técnicas',
  );
  protected readonly heroImageUrl = computed(() =>
    withBannerFallback(this.data()?.heroImageUrl),
  );
  protected readonly categories = computed(() => this.data()?.categories ?? []);

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
        },
      });
  }

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.reload$.next();
  }
}
