import { Component, input } from '@angular/core';

@Component({
  selector: 'app-graphic-section',
  templateUrl: './graphic-section.html',
  styleUrl: './graphic-section.css',
})
export class GraphicSection {
  readonly imageUrl = input<string | null | undefined>('/img/decor/red-paint.png');
}
