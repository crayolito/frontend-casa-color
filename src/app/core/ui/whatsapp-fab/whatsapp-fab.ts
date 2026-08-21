import { Component, computed, input } from '@angular/core';
import {
  HomeFloating,
  HomeWhatsapp,
} from '../../../features/home/data/home-content.model';
import { whatsappHref } from '../../../shared/util/whatsapp';

@Component({
  selector: 'app-whatsapp-fab',
  templateUrl: './whatsapp-fab.html',
  styleUrl: './whatsapp-fab.css',
})
export class WhatsappFab {
  readonly floating = input<HomeFloating | null>(null);

  protected readonly href = computed(() =>
    whatsappHref(this.floating()?.whatsapp as HomeWhatsapp | null),
  );

  protected readonly visible = computed(() => !!this.href());
}
