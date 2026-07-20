import { Component, input } from '@angular/core';
import { IconBlock } from '../../util/producto-data';

@Component({
  selector: 'app-product-summary',
  templateUrl: './product-summary.html',
  styleUrl: './product-summary.css',
})
export class ProductSummary {
  readonly title = input.required<string>();
  readonly description = input.required<IconBlock>();
}
