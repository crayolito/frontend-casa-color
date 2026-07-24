import { Component, input } from '@angular/core';
import {
  HomeFloating,
  HomeFooter,
} from '../../../features/home/data/home-content.model';
import {
  DEFAULT_IMAGES,
  withLogoFallback,
} from '../../../shared/util/default-images';

const DEFAULT_FOOTER: HomeFooter = {
  logoUrl: DEFAULT_IMAGES.logo,
  address: [
    'Polígono Industrial Sur 8',
    'Avenida Sonella 127',
    '12200 ONDA',
    'Castellón · Spain',
  ],
  phones: ['964 431 110', '964 444 145', '964 521 387'],
  legalLinks: [
    { label: 'Empresa', href: '#' },
    { label: 'Aviso Legal', href: '#' },
    { label: 'Política Protección de Datos', href: '#' },
    { label: 'Contacto', href: '#' },
  ],
  social: {
    whatsapp: { show: false },
    instagram: { show: false },
    tiktok: { show: false },
    facebook: { show: false },
  },
  copyright: {
    text: '© 2026 José Alejandro Sahonero Salas',
    designBy: 'Crayolito',
    designByHref: '',
  },
};

@Component({
  selector: 'app-footer',
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  readonly footer = input<HomeFooter | null>(null);
  /** Logo del header (dinámico); se usa si el footer no tiene logoUrl. */
  readonly headerLogoUrl = input<string | null>(null);
  /** Reservado: WhatsApp vive en el FAB global, no en el footer. */
  readonly floating = input<HomeFloating | null>(null);

  protected data(): HomeFooter {
    return this.footer() ?? DEFAULT_FOOTER;
  }

  protected logoSrc(): string {
    const footerUrl = this.data().logoUrl?.trim();
    if (footerUrl) return footerUrl;
    return withLogoFallback(this.headerLogoUrl());
  }

  protected telHref(phone: string): string {
    return `tel:${phone.replaceAll(' ', '')}`;
  }

  /** Instagram / TikTok / Facebook en la franja negra. WhatsApp → FAB. */
  protected visibleSocial(): Array<{
    key: string;
    url: string;
    label: string;
  }> {
    const s = this.data().social;
    const facebook = s.facebook ?? s.twitter;
    const entries: Array<{ key: string; url: string; label: string; show: boolean }> = [
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
