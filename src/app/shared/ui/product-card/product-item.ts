export interface ProductItem {
  title: string;
  href: string;
  image: string;
  imageWidth: number;
  imageHeight: number;
  categories: { label: string; href: string }[];
  /** Segunda imagen hover (solo algunos productos del clon). */
  hoverImage?: string;
}
