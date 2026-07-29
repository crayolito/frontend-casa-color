import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
} from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HomeApi } from '../../../features/home/data/home.api';
import { headerToLogo } from '../../../features/home/data/home-content.model';
import { Header } from '../header/header';
import { Footer } from '../footer/footer';

@Component({
  selector: 'app-public-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, Header, Footer],
  templateUrl: './public-layout.html',
  styleUrl: './public-layout.css',
})
export class PublicLayout implements OnInit {
  private readonly homeApi = inject(HomeApi);

  protected readonly content = this.homeApi.content;
  protected readonly loading = this.homeApi.loading;

  protected readonly logo = computed(() =>
    headerToLogo(this.content()?.header),
  );
  protected readonly searchCategories = computed(
    () => this.content()?.categories.items ?? [],
  );
  protected readonly dynamicNav = computed(
    () => this.content()?.nav?.items ?? null,
  );

  ngOnInit(): void {
    this.homeApi.ensureLoaded().subscribe({ error: () => undefined });
  }
}
