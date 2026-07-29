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
import { Reveal } from '../../../shared/util/reveal/reveal';
import {
  ResolvedErrorMessage,
  resolveErrorMessage,
} from '../../../shared/errors/resolve-error-message';
import { ContactoApi } from '../../admin/data/contacto.api';
import { Branch, ContactoSettings } from '../../admin/data/admin.models';
import { ContactHero } from '../ui/contact-hero/contact-hero';
import { ContactInfoBlockComponent } from '../ui/contact-info-block/contact-info-block';
import { BranchMap } from '../ui/branch-map/branch-map';
import { BranchList } from '../ui/branch-list/branch-list';
import {
  BranchWithDistance,
  CONTACT_HERO_FALLBACK,
  buildContactInfoBlocks,
} from '../data/contacto.models';
import { getUserPosition, haversineDistance, LatLng } from '../util/geo';

@Component({
  selector: 'app-contacto',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    Container,
    Reveal,
    ContactHero,
    ContactInfoBlockComponent,
    BranchMap,
    BranchList,
  ],
  templateUrl: './contacto.html',
  styleUrl: './contacto.css',
})
export class Contacto implements OnInit {
  private readonly api = inject(ContactoApi);
  private readonly destroyRef = inject(DestroyRef);
  private readonly reload$ = new Subject<void>();

  protected readonly loading = signal(true);
  protected readonly error = signal<ResolvedErrorMessage | null>(null);
  protected readonly settings = signal<ContactoSettings | null>(null);
  protected readonly branches = signal<Branch[]>([]);
  protected readonly selectedId = signal<number | null>(null);
  protected readonly userLocation = signal<LatLng | null>(null);
  protected readonly geoStatus = signal<'pending' | 'granted' | 'denied'>(
    'pending',
  );

  private readonly distances = signal<Map<number, number>>(new Map());

  protected readonly heroImage = computed(() => {
    const url = this.settings()?.heroImageUrl?.trim();
    return url || CONTACT_HERO_FALLBACK;
  });

  protected readonly infoBlocks = computed(() => {
    const s = this.settings();
    return s ? buildContactInfoBlocks(s) : [];
  });

  protected readonly branchesWithDistance = computed<BranchWithDistance[]>(
    () => {
      const distMap = this.distances();
      const withDist: BranchWithDistance[] = this.branches().map((b) => ({
        ...b,
        distanceKm: distMap.has(b.id) ? (distMap.get(b.id) as number) : null,
      }));

      if (distMap.size === 0) {
        return withDist;
      }

      return [...withDist].sort(
        (a, b) => (a.distanceKm ?? Infinity) - (b.distanceKm ?? Infinity),
      );
    },
  );

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
          this.settings.set(res.settings);
          this.branches.set(res.branches);
          void this.resolveGeo(res.branches);
        },
      });
  }

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.reload$.next();
  }

  protected onSelectBranch(id: number): void {
    this.selectedId.set(id);
  }

  private async resolveGeo(branchList: Branch[]): Promise<void> {
    this.geoStatus.set('pending');
    const pos = await getUserPosition();
    if (!pos) {
      this.geoStatus.set('denied');
      this.distances.set(new Map());
      this.userLocation.set(null);
      return;
    }

    const map = new Map<number, number>();
    for (const branch of branchList) {
      map.set(
        branch.id,
        haversineDistance(pos, { lat: branch.lat, lng: branch.lng }),
      );
    }
    this.distances.set(map);
    this.userLocation.set(pos);
    this.geoStatus.set('granted');
  }
}
