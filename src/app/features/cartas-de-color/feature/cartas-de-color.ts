import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  OnInit,
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
import { ColorCard as ColorCardData } from '../../admin/data/admin.models';
import { ColorCardsApi } from '../../admin/data/color-cards.api';
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
  private readonly destroyRef = inject(DestroyRef);
  private readonly reload$ = new Subject<void>();

  protected readonly heading = CARTAS_HEADING;
  protected readonly cartas = signal<ColorCardData[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal<ResolvedErrorMessage | null>(null);

  constructor() {
    this.reload$
      .pipe(
        tap(() => {
          this.loading.set(true);
          this.error.set(null);
        }),
        switchMap(() =>
          this.api.listPublic(1, 50).pipe(
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
          this.cartas.set(res.data);
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
