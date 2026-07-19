import { Component } from '@angular/core';

@Component({
  selector: 'app-graphic-section',
  template: `
    <div class="spacer" aria-hidden="true"></div>
    <section
      class="graphic"
      aria-hidden="true"
      style="background-image: url('/img/decor/red-paint.png')"
    ></section>
  `,
  styles: `
    :host {
      display: block;
    }

    .spacer {
      height: 50px;
    }

    .graphic {
      min-height: 220px;
      background-position: center;
      background-size: cover;
      background-repeat: no-repeat;
    }

    @media (min-width: 1000px) {
      .graphic {
        min-height: 320px;
      }
    }
  `,
})
export class GraphicSection {}
