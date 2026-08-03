import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HomeApi } from '../../../features/home/data/home.api';
import { headerToLogo } from '../../../features/home/data/home-content.model';
import { GraphicSection } from '../../../features/home/ui/graphic-section/graphic-section';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';

@Component({
  selector: 'app-public-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, Header, Footer, GraphicSection],
  templateUrl: './public-layout.html',
  styleUrl: './public-layout.css',
})
export class PublicLayout implements OnInit {
  private readonly homeApi = inject(HomeApi);
  private readonly router = inject(Router);

  protected readonly content = this.homeApi.content;
  protected readonly loading = this.homeApi.loading;

  private readonly url = signal(this.router.url);

  protected readonly logo = computed(() =>
    headerToLogo(this.content()?.header),
  );
  protected readonly searchCategories = computed(
    () => this.content()?.categories.items ?? [],
  );
  protected readonly dynamicNav = computed(
    () => this.content()?.nav?.items ?? null,
  );

  /** Clon: /catalogos va directo al footer sin franja roja. */
  protected readonly showGraphic = computed(() => {
    const path = this.url().split('?')[0];
    return path !== '/catalogos' && !path.startsWith('/catalogos/');
  });

  constructor() {
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe((e) => this.url.set(e.urlAfterRedirects));
  }

  ngOnInit(): void {
    this.homeApi.loadHome().subscribe({ error: () => undefined });
  }
}
