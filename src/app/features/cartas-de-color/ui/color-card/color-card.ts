import { Component, input } from '@angular/core';
import { ColorCard as ColorCardModel } from '../../util/cartas-de-color-data';

@Component({
  selector: 'app-color-card',
  host: { class: 'color-card' },
  templateUrl: './color-card.html',
  styleUrl: './color-card.css',
})
export class ColorCard {
  readonly card = input.required<ColorCardModel>();
}
