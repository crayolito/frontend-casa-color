import {
  Component,
  OnInit,
  computed,
  signal,
} from '@angular/core';
import { Header } from '../../../core/ui/header/header';
import { Footer } from '../../../core/ui/footer/footer';
import { Container } from '../../../shared/ui/container/container';
import { Reveal } from '../../../shared/util/reveal/reveal';
import { ContactHero } from '../ui/contact-hero/contact-hero';
import { ContactInfoBlockComponent } from '../ui/contact-info-block/contact-info-block';
import { BranchMap } from '../ui/branch-map/branch-map';
import { BranchList } from '../ui/branch-list/branch-list';
import {
  BRANCHES,
  BranchWithDistance,
  CONTACT_INFO_BLOCKS,
} from '../util/contacto-data';
import { getUserPosition, haversineDistance, LatLng } from '../util/geo';

@Component({
  selector: 'app-contacto',
  imports: [
    Header,
    Footer,
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
  protected readonly infoBlocks = CONTACT_INFO_BLOCKS;
  protected readonly selectedId = signal<string | null>(null);
  protected readonly userLocation = signal<LatLng | null>(null);
  protected readonly geoStatus = signal<'pending' | 'granted' | 'denied'>(
    'pending',
  );

  private readonly distances = signal<Map<string, number>>(new Map());

  protected readonly branchesWithDistance = computed<BranchWithDistance[]>(
    () => {
      const distMap = this.distances();
      const withDist: BranchWithDistance[] = BRANCHES.map((b) => ({
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

  protected readonly branches = BRANCHES;

  async ngOnInit(): Promise<void> {
    const pos = await getUserPosition();
    if (!pos) {
      this.geoStatus.set('denied');
      return;
    }

    const map = new Map<string, number>();
    for (const branch of BRANCHES) {
      map.set(
        branch.id,
        haversineDistance(pos, { lat: branch.lat, lng: branch.lng }),
      );
    }
    this.distances.set(map);
    this.userLocation.set(pos);
    this.geoStatus.set('granted');
  }

  protected onSelectBranch(id: string): void {
    this.selectedId.set(id);
  }
}
