import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  IconBlock,
  ProductCategory,
} from '../../util/producto-view.model';
import { SafeHtmlPipe } from '../../../../shared/pipes/safe-html.pipe';
import { ProductInfoRow } from '../product-info-row/product-info-row';

/** Summary Salient: título + descripción + presentacion/acabados/color + meta. */
@Component({
  selector: 'app-product-summary',
  imports: [SafeHtmlPipe, ProductInfoRow, RouterLink],
  templateUrl: './product-summary.html',
  styleUrl: './product-summary.css',
})
export class ProductSummary {
  readonly title = input.required<string>();
  readonly description = input.required<IconBlock>();
  readonly presentacion = input.required<IconBlock>();
  readonly acabados = input.required<IconBlock>();
  readonly color = input.required<IconBlock>();
  readonly categories = input<ProductCategory[]>([]);
}
