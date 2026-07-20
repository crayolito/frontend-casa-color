import { Component } from '@angular/core';
import { Header } from '../../../core/ui/header/header';
import { Footer } from '../../../core/ui/footer/footer';
import { Container } from '../../../shared/ui/container/container';
import { ColorCard } from '../ui/color-card/color-card';
import { CARTAS, CARTAS_HEADING } from '../util/cartas-de-color-data';

@Component({
  selector: 'app-cartas-de-color',
  imports: [Header, Footer, Container, ColorCard],
  templateUrl: './cartas-de-color.html',
  styleUrl: './cartas-de-color.css',
})
export class CartasDeColor {
  protected readonly heading = CARTAS_HEADING;
  protected readonly cartas = CARTAS;
}
