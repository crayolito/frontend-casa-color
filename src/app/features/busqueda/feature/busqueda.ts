import { Component } from '@angular/core';
import { Header } from '../../../core/ui/header/header';
import { Footer } from '../../../core/ui/footer/footer';
import { Container } from '../../../shared/ui/container/container';
import { SearchResultCard } from '../ui/search-result-card/search-result-card';
import { SearchSidebarMenu } from '../ui/search-sidebar-menu/search-sidebar-menu';
import {
  MOCK_RESULTS,
  SEARCH_RESULT_COUNT,
  SEARCH_TERM,
} from '../util/busqueda-data';

@Component({
  selector: 'app-busqueda',
  imports: [Header, Footer, Container, SearchSidebarMenu, SearchResultCard],
  templateUrl: './busqueda.html',
  styleUrl: './busqueda.css',
})
export class Busqueda {
  protected readonly searchTerm = SEARCH_TERM;
  protected readonly resultCount = SEARCH_RESULT_COUNT;
  protected readonly results = MOCK_RESULTS;
}
