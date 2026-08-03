import { DEFAULT_IMAGES } from '../../../shared/util/default-images';

export interface EmpresaHero {
  imageUrl: string;
}

export interface EmpresaSection {
  id: string;
  title: string;
  titleColor?: string;
  descriptionHtml: string;
  largeImageUrl?: string;
  sideImageUrl?: string;
  sortOrder: number;
}

export interface EmpresaContent {
  hero: EmpresaHero;
  sections: EmpresaSection[];
}

export const EMPRESA_HERO_FALLBACK = DEFAULT_IMAGES.banner;
export const DEFAULT_EMPRESA_TITLE_COLOR = '#dd3333';
