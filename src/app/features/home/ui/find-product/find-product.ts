import { Component, input } from '@angular/core';
import { HomeFindProduct } from '../../data/home-content.model';

@Component({
  selector: 'app-find-product',
  templateUrl: './find-product.html',
  styleUrl: './find-product.css',
})
export class FindProduct {
  readonly data = input.required<HomeFindProduct>();
}
