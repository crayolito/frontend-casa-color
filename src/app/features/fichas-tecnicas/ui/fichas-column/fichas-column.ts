import { Component, input } from '@angular/core';
import { FichasTecnicasCategoryPublic } from '../../../admin/data/admin.models';
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
  imports: [FichasToggle],
  templateUrl: './fichas-column.html',
  styleUrl: './fichas-column.css',
})
export class FichasColumn {
  readonly category = input.required<FichasTecnicasCategoryPublic>();

  protected variantFor(index: number): FichasToggleVariant {
    return VARIANTS[index % VARIANTS.length];
  }
}
