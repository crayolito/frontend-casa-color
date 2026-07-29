import { Component, input, linkedSignal } from '@angular/core';

/** Clase Salient del clon: accent-color / extra-color-1|2|3 / default. */
export type FichasToggleVariant =
  | 'accent'
  | 'extra-1'
  | 'extra-2'
  | 'extra-3'
  | 'default';

let fichasToggleSeq = 0;

@Component({
  selector: 'app-fichas-toggle',
  templateUrl: './fichas-toggle.html',
  styleUrl: './fichas-toggle.css',
})
export class FichasToggle {
  private readonly defaultPanelId = `fichas-toggle-panel-${++fichasToggleSeq}`;

  readonly title = input.required<string>();
  readonly variant = input<FichasToggleVariant>('default');
  readonly panelId = input(this.defaultPanelId);
  readonly initiallyOpen = input(false);

  protected readonly open = linkedSignal(() => this.initiallyOpen());

  protected toggle(): void {
    this.open.update((value) => !value);
  }
}
