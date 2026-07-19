import { Component } from '@angular/core';
import { Header } from '../../../core/ui/header/header';
import { Footer } from '../../../core/ui/footer/footer';
import {
  CATEGORY_LINES,
  HERO_SLIDES,
} from '../../../shared/util/data/home-data';
import { HeroSlider } from '../ui/hero-slider/hero-slider';
import { DecorDivider } from '../ui/decor-divider/decor-divider';
import { FindProduct } from '../ui/find-product/find-product';
import { CategoryAccordion } from '../ui/category-accordion/category-accordion';
import { GraphicSection } from '../ui/graphic-section/graphic-section';
import { Reveal } from '../../../shared/util/reveal/reveal';

@Component({
  selector: 'app-home',
  imports: [
    Header,
    Footer,
    HeroSlider,
    DecorDivider,
    FindProduct,
    CategoryAccordion,
    GraphicSection,
    Reveal,
  ],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home {
  protected readonly slides = HERO_SLIDES;
  protected readonly categoryLines = CATEGORY_LINES;
}
