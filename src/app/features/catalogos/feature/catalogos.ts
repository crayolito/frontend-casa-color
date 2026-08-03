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
import { catchError, of } from 'rxjs';
import {
  ResolvedErrorMessage,
  resolveErrorMessage,
} from '../../../shared/errors/resolve-error-message';
import { withBannerFallback } from '../../../shared/util/default-images';
import { ImgFallback } from '../../../shared/util/img-fallback/img-fallback';
import {
  CatalogosPageApi,
  CatalogosPageContent,
} from '../data/catalogos-page.api';

@Component({
  selector: 'app-catalogos',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ImgFallback],
  templateUrl: './catalogos.html',
  styleUrl: './catalogos.css',
})
export class Catalogos implements OnInit {
  private readonly api = inject(CatalogosPageApi);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly content = signal<CatalogosPageContent | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<ResolvedErrorMessage | null>(null);

  protected readonly imageSrc = computed(() =>
    withBannerFallback(this.content()?.imageUrl),
  );

  protected readonly hasContent = computed(() => {
    const c = this.content();
    return !!(c?.imageUrl?.trim() || c?.pdfUrl?.trim());
  });

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.api
      .getPublic()
      .pipe(
        catchError((err: unknown) => {
          this.error.set(resolveErrorMessage(err));
          return of(null);
        }),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe({
        next: (data) => {
          this.loading.set(false);
          this.content.set(data);
        },
      });
  }
}
