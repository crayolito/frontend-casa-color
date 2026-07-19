import { Component, input } from '@angular/core';
import { Accordion } from '../../../../shared/ui/accordion/accordion';
import { Container } from '../../../../shared/ui/container/container';
import { Reveal } from '../../../../shared/util/reveal/reveal';
import { CategoryLine } from '../../../../shared/util/data/home-data';

@Component({
  selector: 'app-category-accordion',
  imports: [Container, Accordion, Reveal],
  templateUrl: './category-accordion.html',
  styleUrl: './category-accordion.css',
})
export class CategoryAccordion {
  readonly lines = input.required<CategoryLine[]>();
}
