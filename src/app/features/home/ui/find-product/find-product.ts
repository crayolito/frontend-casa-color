import { Component, computed, input } from '@angular/core';
import { HomeFindProduct } from '../../data/home-content.model';

const DEFAULT_BG = '#dd3333';
const DEFAULT_TEXT = '#ffffff';
const HEX = /^#[0-9A-Fa-f]{6}$/;

@Component({
  selector: 'app-find-product',
  templateUrl: './find-product.html',
  styleUrl: './find-product.css',
})
export class FindProduct {
  readonly data = input.required<HomeFindProduct>();

  protected readonly sectionBg = computed(() => {
    const value = this.data().sectionBgColor?.trim();
    return value && HEX.test(value) ? value : DEFAULT_BG;
  });

  protected readonly sectionText = computed(() => {
    const value = this.data().sectionTextColor?.trim();
    return value && HEX.test(value) ? value : DEFAULT_TEXT;
  });
}
