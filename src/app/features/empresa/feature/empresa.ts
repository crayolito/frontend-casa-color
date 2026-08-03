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
import { Reveal } from '../../../shared/util/reveal/reveal';
import { ImgFallback } from '../../../shared/util/img-fallback/img-fallback';
import {
  ResolvedErrorMessage,
  resolveErrorMessage,
} from '../../../shared/errors/resolve-error-message';
import { EmpresaPublicApi } from '../data/empresa.api';
import { EmpresaContent } from '../data/empresa.model';
import { EmpresaHeroComponent } from '../ui/empresa-hero/empresa-hero';
import { EmpresaSectionComponent } from '../ui/empresa-section/empresa-section';

@Component({
  selector: 'app-empresa',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Reveal, ImgFallback, EmpresaHeroComponent, EmpresaSectionComponent],
  templateUrl: './empresa.html',
  styleUrl: './empresa.css',
})
export class Empresa implements OnInit {
  private readonly api = inject(EmpresaPublicApi);
  private readonly destroyRef = inject(DestroyRef);
  private readonly reload$ = new Subject<void>();

  protected readonly loading = signal(true);
  protected readonly error = signal<ResolvedErrorMessage | null>(null);
  protected readonly content = signal<EmpresaContent | null>(null);

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
          this.content.set(res);
        },
      });
  }

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.reload$.next();
  }

  /** Logo lateral: primera sección que tenga sideImageUrl (como la clonada: uno a la izq). */
  protected sideLogoUrl(content: EmpresaContent): string | null {
    for (const section of content.sections) {
      const url = section.sideImageUrl?.trim();
      if (url) return url;
    }
    return null;
  }
}
