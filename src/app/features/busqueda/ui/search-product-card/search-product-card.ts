import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DEFAULT_IMAGES } from '../../../../shared/util/default-images';
import {
  ImgFallback,
  ImgFallbackKind,
} from '../../../../shared/util/img-fallback/img-fallback';
import {
  SearchProductCardItem,
  searchProductCardBadge,
} from '../../util/search-product-card-item';

@Component({
  selector: 'app-search-product-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, ImgFallback],
  host: {
    class: 'result',
    '[attr.data-post-thumb]': '"1"',
  },
  templateUrl: './search-product-card.html',
  styleUrl: './search-product-card.css',
})
export class SearchProductCard {
  readonly result = input.required<SearchProductCardItem>();

  protected readonly badge = computed(() =>
    searchProductCardBadge(this.result().type),
  );

  protected readonly fallbackKind = computed((): ImgFallbackKind => {
    const t = this.result().type;
    if (t === 'categoria') return 'category';
    if (t === 'catalogo') return 'catalog';
    return 'product';
  });

  protected readonly fallbackSrc = computed(() => {
    const kind = this.fallbackKind();
    if (kind === 'category') return DEFAULT_IMAGES.category;
    if (kind === 'catalog') return DEFAULT_IMAGES.catalog;
    return DEFAULT_IMAGES.product;
  });
}
