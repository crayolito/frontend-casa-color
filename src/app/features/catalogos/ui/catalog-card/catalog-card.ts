import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
} from '@angular/core';
import { PublicCatalog } from '../../../../core/http/catalogs-public.api';
import { ImgFallback } from '../../../../shared/util/img-fallback/img-fallback';
import { withCatalogFallback } from '../../../../shared/util/default-images';

@Component({
  selector: 'app-catalog-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'catalog-card' },
  imports: [ImgFallback],
  templateUrl: './catalog-card.html',
  styleUrl: './catalog-card.css',
})
export class CatalogCard {
  readonly catalog = input.required<PublicCatalog>();

  protected readonly imageSrc = computed(() =>
    withCatalogFallback(this.catalog().imageUrl),
  );
}
