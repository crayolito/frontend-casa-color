import { Component, input } from '@angular/core';
import { ProductItem } from '../../util/imprimaciones-data';

@Component({
  selector: 'app-product-card',
  host: { class: 'product-card' },
  templateUrl: './product-card.html',
  styleUrl: './product-card.css',
})
export class ProductCard {
  readonly product = input.required<ProductItem>();
}
