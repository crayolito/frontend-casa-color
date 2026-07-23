import { Component, computed, input } from '@angular/core';
import { IconBlock } from '../../util/producto-data';
import { SafeHtmlPipe } from '../../../../shared/pipes/safe-html.pipe';

@Component({
  selector: 'app-product-description-tab',
  imports: [SafeHtmlPipe],
  templateUrl: './product-description-tab.html',
  styleUrl: './product-description-tab.css',
})
export class ProductDescriptionTab {
  readonly blocks = input.required<IconBlock[]>();
  readonly fichaHref = input<string>('');

  /** index.html:376-420 col izquierda — Usos + Preparación */
  protected readonly leftBlocks = computed(() => this.blocks().slice(0, 2));
  /** index.html:421-474 col derecha — resto */
  protected readonly rightBlocks = computed(() => this.blocks().slice(2));
}
