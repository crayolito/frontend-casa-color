import {
  PublicProduct,
  PublicProductCatalogRef,
} from '../../../core/http/products-public.api';
import { ProductItem } from '../../../shared/ui/product-card/product-item';
import { DEFAULT_IMAGES } from '../../../shared/util/default-images';
import {
  BreadcrumbItem,
  GalleryImage,
  IconBlock,
  ProductCategory,
  ProductoView,
} from './producto-view.model';

const SUMMARY_META = {
  descripcion: {
    icon: '/img/productos/icono-descripcion-100px.png',
    title: 'Descripción',
    titleColor: '#ff4b3c',
  },
  presentacion: {
    icon: '/img/productos/icono-presentacion-100px.png',
    title: 'Presentación',
    titleColor: '#8a7cd7',
  },
  acabados: {
    icon: '/img/productos/icono-acabados-100px.png',
    title: 'Acabados',
    titleColor: '#ea5383',
  },
  color: {
    icon: '/img/productos/icono-color-100px.png',
    title: 'Color',
    titleColor: '#ffa100',
  },
} as const;

const DEFAULT_GALLERY_W = 600;
const DEFAULT_GALLERY_H = 638;
const RELATED_IMAGE_W = 375;
const RELATED_IMAGE_H = 400;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function wrapParagraph(htmlOrText: string, alreadyHtml: boolean): string {
  const trimmed = htmlOrText.trim();
  if (!trimmed) return '';
  if (alreadyHtml) return trimmed;
  return `<p>${escapeHtml(trimmed)}</p>`;
}

function listHtml(items: string[]): string {
  if (items.length === 0) return '';
  const lis = items
    .map((v) => v.trim())
    .filter(Boolean)
    .map((v) => `<li>${escapeHtml(v)}</li>`)
    .join('');
  return lis ? `<ul>${lis}</ul>` : '';
}

function mapGallery(product: PublicProduct): GalleryImage[] {
  const images = [...(product.images ?? [])].sort(
    (a, b) => a.displayOrder - b.displayOrder,
  );
  if (images.length > 0) {
    return images.map((img) => ({
      src: img.url,
      largeSrc: img.url,
      thumb: img.url,
      width: DEFAULT_GALLERY_W,
      height: DEFAULT_GALLERY_H,
      largeWidth: DEFAULT_GALLERY_W,
      largeHeight: DEFAULT_GALLERY_H,
      alt: product.title,
    }));
  }
  const fallback = product.mainImageUrl?.trim() || DEFAULT_IMAGES.product;
  return [
    {
      src: fallback,
      largeSrc: fallback,
      thumb: fallback,
      width: DEFAULT_GALLERY_W,
      height: DEFAULT_GALLERY_H,
      largeWidth: DEFAULT_GALLERY_W,
      largeHeight: DEFAULT_GALLERY_H,
      alt: product.title,
    },
  ];
}

function mapDescription(product: PublicProduct): IconBlock {
  const meta = SUMMARY_META.descripcion;
  const raw = product.description ?? '';
  const looksHtml = /<[a-z][\s\S]*>/i.test(raw);
  return {
    ...meta,
    bodyHtml: wrapParagraph(raw, looksHtml),
  };
}

function mapPresentacion(product: PublicProduct): IconBlock {
  const values = (product.presentations ?? []).map((p) => p.value);
  return {
    ...SUMMARY_META.presentacion,
    bodyHtml: listHtml(values),
  };
}

function mapAcabados(product: PublicProduct): IconBlock {
  const names = (product.finishes ?? []).map((f) => f.name);
  return {
    ...SUMMARY_META.acabados,
    bodyHtml: listHtml(names),
  };
}

function mapColor(product: PublicProduct): IconBlock {
  const names = [...(product.colors ?? [])]
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((c) => c.name?.trim())
    .filter((n): n is string => !!n);
  // Live Colom: Color siempre es <ul><li>nombre</li></ul>; fallback a conteo si no hay nombres
  let bodyHtml = '';
  if (names.length > 0) {
    bodyHtml = listHtml(names);
  } else {
    const n = product.colorsCount ?? 0;
    if (n > 0) {
      bodyHtml = listHtml([`${n} ${n === 1 ? 'color' : 'colores'}`]);
    }
  }
  return {
    ...SUMMARY_META.color,
    bodyHtml,
  };
}

function mapSections(product: PublicProduct): IconBlock[] {
  return [...(product.sections ?? [])]
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((s) => ({
      icon: s.icon?.trim() || SUMMARY_META.descripcion.icon,
      title: s.title,
      titleColor: s.titleColor?.trim() || '#333333',
      bodyHtml: typeof s.content === 'string' ? s.content : '',
    }));
}

function uniqueCategories(
  catalogs: PublicProductCatalogRef[],
): ProductCategory[] {
  const seen = new Set<string>();
  const out: ProductCategory[] = [];
  for (const c of catalogs) {
    const label = c.categoryName?.trim();
    const slug = c.categorySlug?.trim();
    if (!label || seen.has(label)) continue;
    seen.add(label);
    out.push({
      label,
      href: slug ? `/categoria/${slug}/productos` : '#',
    });
  }
  return out;
}

function primaryCatalog(
  product: PublicProduct,
): PublicProductCatalogRef | undefined {
  const list = product.catalogs ?? [];
  return list.find((c) => c.id === product.catalogId) ?? list[0];
}

function mapBreadcrumb(product: PublicProduct): BreadcrumbItem[] {
  const primary = primaryCatalog(product);
  const crumbs: BreadcrumbItem[] = [{ label: 'Inicio', href: '/' }];

  const categoryName = primary?.categoryName?.trim();
  const categorySlug = primary?.categorySlug?.trim();
  if (categoryName) {
    crumbs.push({
      label: categoryName,
      href: categorySlug ? `/categoria/${categorySlug}/productos` : undefined,
    });
  }

  const catalogName = primary?.name?.trim();
  const catalogSlug = primary?.slug?.trim();
  if (catalogName) {
    crumbs.push({
      label: catalogName,
      href: catalogSlug ? `/catalogo/${catalogSlug}/productos` : undefined,
    });
  }

  crumbs.push({ label: product.title });
  return crumbs;
}

export function mapRelatedProducts(
  products: PublicProduct[],
  excludeSlug: string,
  limit = 4,
): ProductItem[] {
  return products
    .filter((p) => p.slug !== excludeSlug)
    .slice(0, limit)
    .map((p) => {
      const main =
        p.images?.find((i) => i.isMain)?.url ??
        p.images?.[0]?.url ??
        p.mainImageUrl ??
        DEFAULT_IMAGES.product;
      return {
        title: p.title,
        href: `/producto/${p.slug}`,
        image: main,
        imageWidth: RELATED_IMAGE_W,
        imageHeight: RELATED_IMAGE_H,
        categories: uniqueCategories(p.catalogs ?? []).map((c) => ({
          label: c.label,
          href: c.href,
        })),
      } satisfies ProductItem;
    });
}

export function mapPublicProductToView(
  product: PublicProduct,
  related: ProductItem[] = [],
): ProductoView {
  return {
    breadcrumb: mapBreadcrumb(product),
    gallery: mapGallery(product),
    title: product.title,
    description: mapDescription(product),
    presentacion: mapPresentacion(product),
    acabados: mapAcabados(product),
    color: mapColor(product),
    categories: uniqueCategories(product.catalogs ?? []),
    tabBlocks: mapSections(product),
    fichaHref: product.technicalSheetUrl?.trim() ?? '',
    related,
  };
}
