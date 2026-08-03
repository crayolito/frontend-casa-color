import { Branch } from '../../admin/data/admin.models';
import { DEFAULT_IMAGES } from '../../../shared/util/default-images';

export type { Branch };

export interface BranchWithDistance extends Branch {
  distanceKm: number | null;
}

export interface ContactInfoLine {
  text: string;
  href?: string;
  strong?: boolean;
}

export interface ContactInfoBlock {
  icon: 'map-marker' | 'phone' | 'envelope';
  lines: ContactInfoLine[];
}

/** Centro aproximado de Santa Cruz de la Sierra para el mapa inicial. */
export const MAP_DEFAULT_CENTER = { lat: -17.7833, lng: -63.1821 };
export const MAP_DEFAULT_ZOOM = 12;
export const MAP_FOCUS_ZOOM = 15;

export const BRANCH_MARKER_ICON = DEFAULT_IMAGES.logo;

export const CONTACT_HERO_FALLBACK = DEFAULT_IMAGES.banner;

export function buildContactInfoBlocks(settings: {
  centralAddressLines: string[];
  centralPhone: string;
  centralWhatsapp: string;
  centralEmail: string;
  attentionLabel: string;
  infoRequestLabel: string;
}): ContactInfoBlock[] {
  const waDigits = settings.centralWhatsapp.replace(/\D/g, '');
  return [
    {
      icon: 'map-marker',
      lines: settings.centralAddressLines.map((text) => ({ text })),
    },
    {
      icon: 'phone',
      lines: [
        { text: settings.attentionLabel },
        {
          text: settings.centralPhone,
          href: waDigits ? `https://wa.me/${waDigits}` : undefined,
          strong: true,
        },
      ],
    },
    {
      icon: 'envelope',
      lines: [
        { text: settings.infoRequestLabel },
        {
          text: settings.centralEmail,
          href: settings.centralEmail
            ? `mailto:${settings.centralEmail}`
            : undefined,
        },
      ],
    },
  ];
}
