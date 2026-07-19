import { Component } from '@angular/core';
import { Header } from '../../../core/ui/header/header';
import { Footer } from '../../../core/ui/footer/footer';
import { Container } from '../../../shared/ui/container/container';
import { CATEGORY_CARDS, LINEA_DECO_INTRO } from '../util/linea-deco-data';

@Component({
  selector: 'app-linea-deco',
  imports: [Header, Footer, Container],
  templateUrl: './linea-deco.html',
  styleUrl: './linea-deco.css',
})
export class LineaDeco {
  protected readonly cards = CATEGORY_CARDS;
  protected readonly intro = LINEA_DECO_INTRO;
}
