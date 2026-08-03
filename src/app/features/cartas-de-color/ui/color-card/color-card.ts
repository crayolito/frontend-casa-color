import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { ColorCard as ColorCardData } from '../../../admin/data/admin.models';
import { SafeHtmlPipe } from '../../../../shared/pipes/safe-html.pipe';
import { withProductFallback } from '../../../../shared/util/default-images';
import { ImgFallback } from '../../../../shared/util/img-fallback/img-fallback';

@Component({
  selector: 'app-color-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'color-card' },
  imports: [SafeHtmlPipe, ImgFallback],
  templateUrl: './color-card.html',
  styleUrl: './color-card.css',
})
export class ColorCard {
  readonly card = input.required<ColorCardData>();

  protected imageSrc(url: string | null | undefined): string {
    return withProductFallback(url);
  }
}
