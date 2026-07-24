import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HomeFindProduct, resolveCtaHref } from '../../data/home-content.model';

@Component({
  selector: 'app-find-product',
  imports: [RouterLink],
  templateUrl: './find-product.html',
  styleUrl: './find-product.css',
})
export class FindProduct {
  readonly data = input.required<HomeFindProduct>();

  protected href(): string | null {
    return resolveCtaHref(this.data());
  }

  protected isInternal(link: string | null): boolean {
    return !!link && link.startsWith('/') && !link.startsWith('//');
  }
}
