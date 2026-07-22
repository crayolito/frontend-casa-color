import { Component, input } from '@angular/core';
import { ProductItem } from './product-item';

@Component({
  selector: 'app-product-card',
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
}
