import { Component } from '@angular/core';
import { Header } from '../../../core/ui/header/header';
import { Footer } from '../../../core/ui/footer/footer';
import { Container } from '../../../shared/ui/container/container';
import { FichasColumn } from '../ui/fichas-column/fichas-column';
import {
  FICHAS_COLUMNS,
  FICHAS_TITLE,
} from '../util/fichas-tecnicas-data';

@Component({
  selector: 'app-fichas-tecnicas',
  imports: [Header, Footer, Container, FichasColumn],
  templateUrl: './fichas-tecnicas.html',
  styleUrl: './fichas-tecnicas.css',
})
export class FichasTecnicas {
  protected readonly title = FICHAS_TITLE;
  protected readonly columns = FICHAS_COLUMNS;
}
