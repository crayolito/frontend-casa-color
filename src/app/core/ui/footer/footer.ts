import { Component, input } from '@angular/core';
import {
  HomeFloating,
  HomeFooter,
} from '../../../features/home/data/home-content.model';
import { withLogoFallback } from '../../../shared/util/default-images';
import { ImgFallback } from '../../../shared/util/img-fallback/img-fallback';

@Component({
  selector: 'app-footer',
  imports: [ImgFallback],
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  /** Contenido del footer desde HomeApi (PublicLayout). Obligatorio. */
  readonly footer = input.required<HomeFooter>();
  /** Logo del header (dinámico); se usa si el footer no tiene logoUrl. */
  readonly headerLogoUrl = input<string | null>(null);
  /** Reservado: WhatsApp vive en el FAB global, no en el footer. */
  readonly floating = input<HomeFloating | null>(null);

  protected data(): HomeFooter {
    return this.footer();
  }

  protected logoSrc(): string {
    const footerUrl = this.data().logoUrl?.trim();
    if (footerUrl) return footerUrl;
    return withLogoFallback(this.headerLogoUrl());
  }

  protected telHref(phone: string): string {
    return `tel:${phone.replaceAll(' ', '')}`;
  }

  /** Omite entradas vacías del admin (evita columna fantasma en el footer). */
  protected visibleLegalLinks(): Array<{ label: string; href: string }> {
    return (this.data().legalLinks ?? []).filter(
      (l) => !!l.label?.trim() && !!l.href?.trim(),
    );
  }

  /** Instagram / TikTok / Facebook en la barra copyright. WhatsApp → FAB. */
  protected visibleSocial(): Array<{
    key: string;
    url: string;
    label: string;
  }> {
    const s = this.data().social;
    const facebook = s.facebook ?? s.twitter;
    const entries: Array<{
      key: string;
      url: string;
      label: string;
      show: boolean;
    }> = [
      {
        key: 'instagram',
        url: s.instagram?.url ?? '',
        label: 'Instagram',
        show: !!s.instagram?.show,
      },
      {
        key: 'tiktok',
        url: s.tiktok?.url ?? '',
        label: 'TikTok',
        show: !!s.tiktok?.show,
      },
      {
        key: 'facebook',
        url: facebook?.url ?? '',
        label: 'Facebook',
        show: !!facebook?.show,
      },
    ];
    return entries
      .filter((e) => e.show && !!e.url.trim())
      .map(({ key, url, label }) => ({ key, url, label }));
  }
}
