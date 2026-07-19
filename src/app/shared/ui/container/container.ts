import { Component } from '@angular/core';

@Component({
  selector: 'app-container',
  template: `<div class="container"><ng-content /></div>`,
  styles: `
    :host {
      display: block;
    }
  `,
})
export class Container {}
