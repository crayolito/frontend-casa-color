import { Component, input } from '@angular/core';

/** Hero parallax — clon index.html:261-273 (#page-header-wrap height 700px). */
@Component({
  selector: 'app-contact-hero',
  templateUrl: './contact-hero.html',
  styleUrl: './contact-hero.css',
})
export class ContactHero {
  readonly backgroundImage = input.required<string>();
}
