import { Component } from '@angular/core';
import { CONTACT_HERO_IMAGE } from '../../util/contacto-data';

/** Hero parallax — clon index.html:261-273 (#page-header-wrap height 700px). */
@Component({
  selector: 'app-contact-hero',
  templateUrl: './contact-hero.html',
  styleUrl: './contact-hero.css',
})
export class ContactHero {
  protected readonly backgroundImage = CONTACT_HERO_IMAGE;
}
