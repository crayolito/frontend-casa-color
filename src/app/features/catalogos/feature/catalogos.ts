import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Header } from '../../../core/ui/header/header';
import { Footer } from '../../../core/ui/footer/footer';
import { Container } from '../../../shared/ui/container/container';
import { ProductCard } from '../../../shared/ui/product-card/product-card';
import {
  BREADCRUMB,
  HEADING,
  ORDERBY_OPTIONS,
  PRODUCTS,
  RESULT_COUNT,
} from '../util/catalogos-data';

@Component({
  selector: 'app-catalogos',
  imports: [Header, Footer, Container, ProductCard, RouterLink],
  templateUrl: './catalogos.html',
  styleUrl: './catalogos.css',
})
export class Catalogos {
  protected readonly heading = HEADING;
  protected readonly breadcrumb = BREADCRUMB;
  protected readonly resultCount = RESULT_COUNT;
  protected readonly orderbyOptions = ORDERBY_OPTIONS;
  protected readonly products = PRODUCTS;
}
