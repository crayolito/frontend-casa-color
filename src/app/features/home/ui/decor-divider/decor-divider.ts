import { Component } from '@angular/core';

@Component({
  selector: 'app-decor-divider',
  template: `
    <div class="decor-divider" aria-hidden="true">
      <img
        class="decor-divider__img"
        src="/img/decor/trazo-amarillo.png"
        alt=""
        width="300"
        height="197"
      />
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .decor-divider {
      display: flex;
      justify-content: center;
      padding: 1.5rem 1rem 0.5rem;
    }

    .decor-divider__img {
      width: min(280px, 70%);
      height: auto;
    }
  `,
})
export class DecorDivider {}
