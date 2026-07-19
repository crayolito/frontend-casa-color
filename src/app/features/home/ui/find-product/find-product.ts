import { Component } from '@angular/core';
import { Container } from '../../../../shared/ui/container/container';

@Component({
  selector: 'app-find-product',
  imports: [Container],
  templateUrl: './find-product.html',
  styleUrl: './find-product.css',
})
export class FindProduct {
  protected onSubmit(event: Event): void {
    event.preventDefault();
  }
}
