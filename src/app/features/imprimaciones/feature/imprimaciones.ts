import { Component } from '@angular/core';
import { Header } from '../../../core/ui/header/header';
import { Footer } from '../../../core/ui/footer/footer';
import { Container } from '../../../shared/ui/container/container';
import { ProductCard } from '../ui/product-card/product-card';
import { SidebarNav } from '../ui/sidebar-nav/sidebar-nav';
import {
  IMPRIMACIONES_HEADING,
  PRODUCTS,
  SIDEBAR_GROUPS,
} from '../util/imprimaciones-data';

@Component({
  selector: 'app-imprimaciones',
  imports: [Header, Footer, Container, ProductCard, SidebarNav],
  templateUrl: './imprimaciones.html',
  styleUrl: './imprimaciones.css',
})
export class Imprimaciones {
  protected readonly heading = IMPRIMACIONES_HEADING;
  protected readonly sidebarGroups = SIDEBAR_GROUPS;
  protected readonly products = PRODUCTS;
}
