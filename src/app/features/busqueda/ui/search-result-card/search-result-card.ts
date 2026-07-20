import { Component, input } from '@angular/core';
import { SearchResultItem } from '../../util/busqueda-data';

@Component({
  selector: 'app-search-result-card',
  host: {
    class: 'result',
    '[attr.data-post-thumb]': 'result().image ? "1" : ""',
  },
  templateUrl: './search-result-card.html',
  styleUrl: './search-result-card.css',
})
export class SearchResultCard {
  readonly result = input.required<SearchResultItem>();
}
