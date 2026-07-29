import { Component, input } from '@angular/core';
import { IconBlock } from '../../util/producto-view.model';
import { SafeHtmlPipe } from '../../../../shared/pipes/safe-html.pipe';

/** Fila Presentación | Acabados+Color — dentro del summary Salient (mitad derecha). */
@Component({
  selector: 'app-product-info-row',
  imports: [SafeHtmlPipe],
  templateUrl: './product-info-row.html',
  styleUrl: './product-info-row.css',
})
export class ProductInfoRow {
  readonly presentacion = input.required<IconBlock>();
  readonly acabados = input.required<IconBlock>();
  readonly color = input.required<IconBlock>();
}
