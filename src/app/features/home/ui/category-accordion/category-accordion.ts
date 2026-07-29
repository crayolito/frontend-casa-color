import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Accordion } from '../../../../shared/ui/accordion/accordion';
import { Container } from '../../../../shared/ui/container/container';
import { Reveal } from '../../../../shared/util/reveal/reveal';
import { withCategoryFallback } from '../../../../shared/util/default-images';
import { ImgFallback } from '../../../../shared/util/img-fallback/img-fallback';
import { HomeCategories, HomeResolvedCategory } from '../../data/home-content.model';

/** Colores de toggle estilo Salient (accent / extra-1 / extra-2 / extra-3). */
const TOGGLE_COLORS = ['#dd3333', '#ffa100', '#2ac4ea', '#81d742'] as const;

@Component({
  selector: 'app-category-accordion',
  imports: [Container, Accordion, Reveal, RouterLink, ImgFallback],
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

  /** Solo linkea si la categoría tiene catálogos. */
  protected categoryHref(cat: HomeResolvedCategory): string | null {
    return cat.catalogs.length > 0 ? `/categoria/${cat.slug}` : null;
  }

  protected productHref(slug: string): string {
    return `/producto/${slug}`;
  }
}
