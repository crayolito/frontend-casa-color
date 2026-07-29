import { LegalPageSettings } from '../../admin/data/admin.models';

export type LegalPageKey = 'aviso-legal' | 'politica-datos';

export const LEGAL_PAGE_DEFAULTS: Record<LegalPageKey, LegalPageSettings> = {
  'aviso-legal': {
    title: 'Aviso Legal',
    bodyHtml: '',
  },
  'politica-datos': {
    title: 'Política de Datos',
    bodyHtml: '',
  },
};

export const LEGAL_PAGE_LABELS: Record<LegalPageKey, string> = {
  'aviso-legal': 'Aviso Legal',
  'politica-datos': 'Política de Datos',
};

export function isLegalPageKey(value: string): value is LegalPageKey {
  return value === 'aviso-legal' || value === 'politica-datos';
}

/** Defensa de tipos: parsea el JSON libre de site-settings. */
export function parseLegalPageSettings(
  value: Record<string, unknown>,
  key: LegalPageKey,
): LegalPageSettings {
  const defaults = LEGAL_PAGE_DEFAULTS[key];
  return {
    title:
      typeof value['title'] === 'string' && value['title'].trim()
        ? value['title'].trim()
        : defaults.title,
    bodyHtml:
      typeof value['bodyHtml'] === 'string' ? value['bodyHtml'] : defaults.bodyHtml,
  };
}

export type { LegalPageSettings };
