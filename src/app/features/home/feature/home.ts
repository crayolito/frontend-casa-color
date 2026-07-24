import { Component, OnInit, inject, signal } from '@angular/core';
import { Header } from '../../../core/ui/header/header';
import { Footer } from '../../../core/ui/footer/footer';
import { HomeApi } from '../data/home.api';
import { HomeContent, headerToLogo } from '../data/home-content.model';
import {
  ResolvedErrorMessage,
  resolveErrorMessage,
} from '../../../shared/errors/resolve-error-message';
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
export class Home implements OnInit {
  private readonly homeApi = inject(HomeApi);

  protected readonly content = signal<HomeContent | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal<ResolvedErrorMessage | null>(null);

  protected readonly headerToLogo = headerToLogo;

  ngOnInit(): void {
    this.load();
  }

  protected load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.homeApi.loadHome().subscribe({
      next: (data) => {
        this.content.set(data);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.loading.set(false);
        this.error.set(resolveErrorMessage(err));
      },
    });
  }
}
