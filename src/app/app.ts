import { Component, OnInit, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map, startWith } from 'rxjs';
import { HomeApi } from './features/home/data/home.api';
import { WhatsappFab } from './core/ui/whatsapp-fab/whatsapp-fab';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, WhatsappFab],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private readonly homeApi = inject(HomeApi);
  private readonly router = inject(Router);

  /** Se actualiza cuando HomeApi carga (home público o admin tras guardar). */
  protected readonly floating = computed(
    () => this.homeApi.content()?.floating ?? null,
  );

  private readonly url = toSignal(
    this.router.events.pipe(
      filter((e): e is NavigationEnd => e instanceof NavigationEnd),
      map(() => this.router.url),
      startWith(this.router.url),
    ),
    { initialValue: this.router.url },
  );

  /** FAB solo en el sitio público; nunca en /admin. */
  protected readonly showFab = computed(() => {
    const path = this.url() ?? this.router.url;
    const onAdmin = path === '/admin' || path.startsWith('/admin/');
    const wa = this.floating()?.whatsapp;
    return !onAdmin && !!wa?.enabled && !!wa.phone?.trim();
  });

  ngOnInit(): void {
    this.homeApi.loadHome().subscribe({ error: () => undefined });
  }
}
