import { Component } from '@angular/core';
import { FOOTER_DATA } from '../../../shared/util/data/home-data';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.html',
  styleUrl: './footer.css',
})
export class Footer {
  protected readonly data = FOOTER_DATA;

  protected telHref(phone: string): string {
    return `tel:${phone.replaceAll(' ', '')}`;
  }
}
