import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Accordion } from '../../../../shared/ui/accordion/accordion';
import { SearchCategoryGroup } from '../../util/search-category-group';

const ACCENT_COLORS = ['#dd3333', '#ffa100', '#2ac4ea', '#81d742'];

@Component({
  selector: 'app-search-category-accordion',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Accordion, RouterLink],
  templateUrl: './search-category-accordion.html',
  styleUrl: './search-category-accordion.css',
})
export class SearchCategoryAccordion {
  readonly groups = input.required<SearchCategoryGroup[]>();
  readonly loading = input(false);

  protected accentColor(index: number): string {
    return ACCENT_COLORS[index % ACCENT_COLORS.length];
  }
}
