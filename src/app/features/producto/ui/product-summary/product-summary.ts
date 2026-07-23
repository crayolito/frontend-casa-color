import { Component, input } from '@angular/core';
import { IconBlock } from '../../util/producto-data';
import { SafeHtmlPipe } from '../../../../shared/pipes/safe-html.pipe';

@Component({
  selector: 'app-product-summary',
  imports: [SafeHtmlPipe],
  templateUrl: './product-summary.html',
  styleUrl: './product-summary.css',
})
export class ProductSummary {
  readonly title = input.required<string>();
  readonly description = input.required<IconBlock>();
}
