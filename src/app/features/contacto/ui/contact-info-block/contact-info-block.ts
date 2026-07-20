import { Component, input } from '@angular/core';
import { ContactInfoBlock } from '../../util/contacto-data';

/** Bloque icono + texto — clon index.html:281-303 (.iwithtext). */
@Component({
  selector: 'app-contact-info-block',
  templateUrl: './contact-info-block.html',
  styleUrl: './contact-info-block.css',
})
export class ContactInfoBlockComponent {
  readonly block = input.required<ContactInfoBlock>();
}
