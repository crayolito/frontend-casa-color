import { Component } from '@angular/core';
import { Header } from '../../../core/ui/header/header';
import { Footer } from '../../../core/ui/footer/footer';
import { Container } from '../../../shared/ui/container/container';
import { ProductCard } from '../../../shared/ui/product-card/product-card';
import { ProductGallery } from '../ui/product-gallery/product-gallery';
import { ProductSummary } from '../ui/product-summary/product-summary';
import { ProductInfoRow } from '../ui/product-info-row/product-info-row';
import { ProductDescriptionTab } from '../ui/product-description-tab/product-description-tab';
import {
  BREADCRUMB,
  FICHA_TECNICA_HREF,
  GALLERY_IMAGES,
  PRODUCT_CATEGORIES,
  PRODUCT_TITLE,
  RELATED_PRODUCTS,
  SUMMARY_ACABADOS,
  SUMMARY_COLOR,
  SUMMARY_DESCRIPTION,
  SUMMARY_PRESENTACION,
  TAB_BLOCKS,
} from '../util/producto-data';

@Component({
  selector: 'app-producto',
  imports: [
    Header,
    Footer,
    Container,
    ProductCard,
    ProductGallery,
    ProductSummary,
    ProductInfoRow,
    ProductDescriptionTab,
  ],
  templateUrl: './producto.html',
  styleUrl: './producto.css',
})
export class Producto {
  protected readonly breadcrumb = BREADCRUMB;
  protected readonly gallery = GALLERY_IMAGES;
  protected readonly title = PRODUCT_TITLE;
  protected readonly description = SUMMARY_DESCRIPTION;
  protected readonly presentacion = SUMMARY_PRESENTACION;
  protected readonly acabados = SUMMARY_ACABADOS;
  protected readonly color = SUMMARY_COLOR;
  protected readonly categories = PRODUCT_CATEGORIES;
  protected readonly tabBlocks = TAB_BLOCKS;
  protected readonly fichaHref = FICHA_TECNICA_HREF;
  protected readonly related = RELATED_PRODUCTS;
}
