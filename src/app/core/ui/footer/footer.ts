import { Component, input } from '@angular/core';
import {
  HomeFloating,
  HomeFooter,
  HomeFooterColumn,
} from '../../../features/home/data/home-content.model';
import { withLogoFallback } from '../../../shared/util/default-images';
import { ImgFallback } from '../../../shared/util/img-fallback/img-fallback';
import { SafeHtmlPipe } from '../../../shared/pipes/safe-html.pipe';

const PHONE_LINE = /^\+?\d[\d\s.\-]{5,}$/;

@Component({
  selector: 'app-footer',
  imports: [ImgFallback, SafeHtmlPipe],
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

  protected visibleColumns(): HomeFooterColumn[] {
    return this.resolveColumns().filter((col) => {
      if (col.type === 'links') {
        return (col.links ?? []).some(
          (l) => !!l.label?.trim() && !!l.href?.trim(),
        );
      }
      if (col.type === 'html') {
        return !!col.html?.trim();
      }
      return (col.lines ?? []).some((line) => !!line.trim());
    });
  }

  protected isPhoneLine(line: string): boolean {
    return PHONE_LINE.test(line.trim());
  }

  protected logoSrc(): string {
    const footerUrl = this.data().logoUrl?.trim();
    if (footerUrl) return footerUrl;
    return withLogoFallback(this.headerLogoUrl());
  }

  protected telHref(phone: string): string {
    return `tel:${phone.replaceAll(' ', '')}`;
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

  private resolveColumns(): HomeFooterColumn[] {
    const cols = this.data().columns;
    if (Array.isArray(cols) && cols.length > 0) {
      return cols.map((c) => {
        if (c.type === 'html' || (c.html?.trim() && c.type !== 'text' && c.type !== 'links')) {
          return {
            type: 'html' as const,
            html: c.html?.trim() ?? '',
            lines: [],
            links: [],
          };
        }
        if (c.type === 'links' || (c.links && c.links.length > 0 && c.type !== 'text')) {
          return {
            type: 'links' as const,
            links: (c.links ?? []).filter(
              (l) => !!l.label?.trim() && !!l.href?.trim(),
            ),
            lines: [],
            html: '',
          };
        }
        return {
          type: 'text' as const,
          lines: (c.lines ?? []).map((l) => l.trim()).filter(Boolean),
          links: [],
          html: '',
        };
      });
    }

    const address = (this.data().address ?? []).filter((l) => !!l.trim());
    const phones = (this.data().phones ?? []).filter((l) => !!l.trim());
    const legal = (this.data().legalLinks ?? []).filter(
      (l) => !!l.label?.trim() && !!l.href?.trim(),
    );
    const out: HomeFooterColumn[] = [
      { type: 'text', lines: address },
      {
        type: 'text',
        lines: phones.length ? ['Consultas y pedidos', ...phones] : [],
      },
    ];
    if (legal.length > 0) {
      out.push({ type: 'links', links: legal });
    }
    return out;
  }
}
