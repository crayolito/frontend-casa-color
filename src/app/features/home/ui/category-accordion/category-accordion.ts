import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Accordion } from '../../../../shared/ui/accordion/accordion';
import { Container } from '../../../../shared/ui/container/container';
import { Reveal } from '../../../../shared/util/reveal/reveal';
import { withCategoryFallback } from '../../../../shared/util/default-images';
import { HomeCategories, HomeResolvedCategory } from '../../data/home-content.model';

/** Colores de toggle estilo Salient (accent / extra-1 / extra-2 / extra-3). */
const TOGGLE_COLORS = ['#dd3333', '#ffa100', '#2ac4ea', '#81d742'] as const;

@Component({
  selector: 'app-category-accordion',
  imports: [Container, Accordion, Reveal, RouterLink],
  templateUrl: './category-accordion.html',
  styleUrl: './category-accordion.css',
})
export class CategoryAccordion {
  readonly categories = input.required<HomeCategories>();

  protected lines(): HomeResolvedCategory[] {
    return this.categories().items ?? [];
  }

  /** Home muestra texto plano; la descripción larga de categoría puede ser HTML. */
  protected plainDescription(line: HomeResolvedCategory): string {
    const raw = line.description?.trim() ?? '';
    if (!raw) return '';
    return raw.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  protected logoSrc(line: HomeResolvedCategory): string {
    return withCategoryFallback(line.imageUrl);
  }

  protected toggleColor(index: number): string {
    return TOGGLE_COLORS[index % TOGGLE_COLORS.length];
  }

  protected categoryHref(_cat: HomeResolvedCategory): string {
    return `/catalogos`;
  }

  protected catalogHref(_slug: string): string {
    return `/catalogos`;
  }

  protected productHref(slug: string): string {
    return `/producto/${slug}`;
  }
}
