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
import { Subject, catchError, forkJoin, of, switchMap, tap } from 'rxjs';
import { Container } from '../../../shared/ui/container/container';
import {
  ResolvedErrorMessage,
  resolveErrorMessage,
} from '../../../shared/errors/resolve-error-message';
import { withBannerFallback } from '../../../shared/util/default-images';
import { ColorCard as ColorCardData } from '../../admin/data/admin.models';
import { ColorCardsApi } from '../../admin/data/color-cards.api';
import { CartasPageApi } from '../data/cartas-page.api';
import { ColorCard } from '../ui/color-card/color-card';

const CARTAS_HEADING = {
  prefix: 'DOCUMENTACIÓN | ',
  strong: 'Cartas de Color',
};

@Component({
  selector: 'app-cartas-de-color',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Container, ColorCard],
  templateUrl: './cartas-de-color.html',
  styleUrl: './cartas-de-color.css',
})
export class CartasDeColor implements OnInit {
  private readonly api = inject(ColorCardsApi);
  private readonly pageApi = inject(CartasPageApi);
  private readonly destroyRef = inject(DestroyRef);
  private readonly reload$ = new Subject<void>();

  protected readonly heading = CARTAS_HEADING;
  protected readonly cartas = signal<ColorCardData[]>([]);
  protected readonly heroUrl = signal<string | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<ResolvedErrorMessage | null>(null);

  protected readonly heroImageUrl = computed(() =>
    withBannerFallback(this.heroUrl()),
  );

  constructor() {
    this.reload$
      .pipe(
        tap(() => {
          this.loading.set(true);
          this.error.set(null);
        }),
        switchMap(() =>
          forkJoin({
            cards: this.api.listPublic(1, 50),
            page: this.pageApi.getPublic().pipe(
              catchError(() => of({ heroImageUrl: null as string | null })),
            ),
          }).pipe(
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
          this.cartas.set(res.cards.data);
          this.heroUrl.set(res.page.heroImageUrl);
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
