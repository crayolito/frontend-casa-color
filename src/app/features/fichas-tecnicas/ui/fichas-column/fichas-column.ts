import { Component, input } from '@angular/core';
import { FichasToggle } from '../fichas-toggle/fichas-toggle';
import { FichasColumn as FichasColumnData } from '../../util/fichas-tecnicas-data';

@Component({
  selector: 'app-fichas-column',
  imports: [FichasToggle],
  templateUrl: './fichas-column.html',
  styleUrl: './fichas-column.css',
})
export class FichasColumn {
  readonly column = input.required<FichasColumnData>();
}
