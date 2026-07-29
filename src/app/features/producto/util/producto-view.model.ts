import { ProductItem } from '../../../shared/ui/product-card/product-item';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface GalleryImage {
  /** Imagen mostrada en el slider. */
  src: string;
  /** Imagen grande para easyzoom + lightbox. */
  largeSrc: string;
  thumb: string;
  width: number;
  height: number;
  largeWidth: number;
  largeHeight: number;
  alt: string;
}

export interface IconBlock {
  icon: string;
  title: string;
  titleColor: string;
  /** HTML sanitizado al renderizar vía safeHtml. */
  bodyHtml: string;
}

export interface ProductCategory {
  label: string;
  href: string;
}

export interface ProductoView {
  breadcrumb: BreadcrumbItem[];
  gallery: GalleryImage[];
  title: string;
  description: IconBlock;
  presentacion: IconBlock;
  acabados: IconBlock;
  color: IconBlock;
  categories: ProductCategory[];
  tabBlocks: IconBlock[];
  fichaHref: string;
  related: ProductItem[];
}
