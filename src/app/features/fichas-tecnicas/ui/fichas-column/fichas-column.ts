import { Component, computed, input } from '@angular/core';
import { FichasTecnicasCategoryPublic } from '../../../admin/data/admin.models';
import { withCategoryFallback } from '../../../../shared/util/default-images';
import { ImgFallback } from '../../../../shared/util/img-fallback/img-fallback';
import { FichasToggle, FichasToggleVariant } from '../fichas-toggle/fichas-toggle';

const VARIANTS: FichasToggleVariant[] = [
  'accent',
  'extra-1',
  'extra-2',
  'extra-3',
  'default',
];

@Component({
  selector: 'app-fichas-column',
  imports: [FichasToggle, ImgFallback],
  templateUrl: './fichas-column.html',
  styleUrl: './fichas-column.css',
})
export class FichasColumn {
  readonly category = input.required<FichasTecnicasCategoryPublic>();

  protected readonly logoSrc = computed(() =>
    withCategoryFallback(this.category().imageUrl),
  );

  /** Todos los catálogos de la categoría (con o sin PDF). */
  protected readonly catalogs = computed(() => this.category().catalogs ?? []);

  protected readonly hasCatalogs = computed(() => this.catalogs().length > 0);

  protected variantFor(index: number): FichasToggleVariant {
    return VARIANTS[index % VARIANTS.length];
  }
}
