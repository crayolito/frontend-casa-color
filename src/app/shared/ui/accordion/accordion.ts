import { Component, input, linkedSignal } from '@angular/core';

let accordionSeq = 0;

@Component({
  selector: 'app-accordion',
  templateUrl: './accordion.html',
  styleUrl: './accordion.css',
})
export class Accordion {
  private readonly defaultPanelId = `accordion-panel-${++accordionSeq}`;

  readonly title = input.required<string>();
  readonly initiallyOpen = input(false);
  readonly panelId = input(this.defaultPanelId);

  protected readonly open = linkedSignal(() => this.initiallyOpen());

  protected toggle(): void {
    this.open.update((value) => !value);
  }
}
