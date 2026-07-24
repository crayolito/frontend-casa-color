import { Component, computed, input } from '@angular/core';
import {
  HomeFloating,
  HomeWhatsapp,
} from '../../../features/home/data/home-content.model';

@Component({
  selector: 'app-whatsapp-fab',
  templateUrl: './whatsapp-fab.html',
  styleUrl: './whatsapp-fab.css',
})
export class WhatsappFab {
  readonly floating = input<HomeFloating | null>(null);

  protected readonly href = computed(() =>
    this.whatsappHref(this.floating()?.whatsapp),
  );

  protected readonly visible = computed(() => !!this.href());

  private whatsappHref(wa?: HomeWhatsapp | null): string {
    if (!wa?.enabled || !wa.phone?.trim()) {
      return '';
    }
    const phone = wa.phone.replace(/\D/g, '');
    if (!phone) {
      return '';
    }
    const text = encodeURIComponent(wa.message?.trim() || '');
    return text ? `https://wa.me/${phone}?text=${text}` : `https://wa.me/${phone}`;
  }
}
