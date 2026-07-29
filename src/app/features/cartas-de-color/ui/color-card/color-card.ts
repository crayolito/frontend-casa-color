import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ColorCard as ColorCardData } from '../../../admin/data/admin.models';
import { SafeHtmlPipe } from '../../../../shared/pipes/safe-html.pipe';

@Component({
  selector: 'app-color-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'color-card' },
  imports: [SafeHtmlPipe],
  templateUrl: './color-card.html',
  styleUrl: './color-card.css',
})
export class ColorCard {
  readonly card = input.required<ColorCardData>();
}
