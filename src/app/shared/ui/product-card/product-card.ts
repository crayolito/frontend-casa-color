import { Component, input } from '@angular/core';
import { ProductItem } from './product-item';
import { withProductFallback } from '../../util/default-images';
import { ImgFallback } from '../../util/img-fallback/img-fallback';

@Component({
  selector: 'app-product-card',
  imports: [ImgFallback],
  host: {
    class: 'product-card',
    '[attr.data-columns]': 'columns()',
  },
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard {
  readonly product = input.required<ProductItem>();
  /** 3 = Imprimaciones; 4 = relacionados single-product; archive-4 = archive WooCommerce 4-col. */
  readonly columns = input<3 | 4 | 'archive-4'>(3);

  protected imageSrc(): string {
    return withProductFallback(this.product().image);
  }
}
