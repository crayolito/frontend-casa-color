import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Subject, catchError, of, switchMap, tap } from 'rxjs';
import { Container } from '../../../shared/ui/container/container';
import { SafeHtmlPipe } from '../../../shared/pipes/safe-html.pipe';
import {
  ResolvedErrorMessage,
  resolveErrorMessage,
} from '../../../shared/errors/resolve-error-message';
import { isAppError } from '../../../shared/util/api-errors';
import { LegalPageApi } from '../data/legal-page.api';
import {
  LEGAL_PAGE_DEFAULTS,
  LegalPageKey,
  LegalPageSettings,
  isLegalPageKey,
} from '../data/legal-page.model';

@Component({
  selector: 'app-pagina-legal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Container, SafeHtmlPipe],
  templateUrl: './pagina-legal.html',
  styleUrl: './pagina-legal.css',
})
export class PaginaLegal {
  private readonly api = inject(LegalPageApi);
  private readonly destroyRef = inject(DestroyRef);
  private readonly reload$ = new Subject<LegalPageKey>();

  /** Bound from route data via withComponentInputBinding. */
  readonly legalKey = input.required<string>();
  readonly title = input<string>('Página legal');

  protected readonly loading = signal(true);
  protected readonly error = signal<ResolvedErrorMessage | null>(null);
  protected readonly missing = signal(false);
  protected readonly settings = signal<LegalPageSettings | null>(null);

  protected readonly pageTitle = computed(() => {
    const fromApi = this.settings()?.title?.trim();
    return fromApi || this.title();
  });

  protected readonly bodyHtml = computed(
    () => this.settings()?.bodyHtml?.trim() ?? '',
  );

  protected readonly isEmpty = computed(
    () => this.missing() || !this.bodyHtml(),
  );

  constructor() {
    this.reload$
      .pipe(
        tap(() => {
          this.loading.set(true);
          this.error.set(null);
          this.missing.set(false);
        }),
        switchMap((key) =>
          this.api.get(key).pipe(
            catchError((err: unknown) => {
              if (isAppError(err) && err.status === 404) {
                this.missing.set(true);
                this.settings.set(LEGAL_PAGE_DEFAULTS[key]);
                return of(null);
              }
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
          this.settings.set(res.settings);
        },
      });

    effect(() => {
      const key = this.legalKey();
      if (isLegalPageKey(key)) {
        this.reload$.next(key);
      }
    });
  }

  protected load(): void {
    const key = this.legalKey();
    if (isLegalPageKey(key)) {
      this.reload$.next(key);
    }
  }
}
