import { A11yModule } from '@angular/cdk/a11y';
import { Component, input, output } from '@angular/core';
import { MobileNavItem } from '../../../shared/util/data/home-data';

@Component({
  selector: 'app-mobile-menu',
  imports: [A11yModule],
  templateUrl: './mobile-menu.html',
  styleUrl: './mobile-menu.css',
})
export class MobileMenu {
  readonly items = input.required<MobileNavItem[]>();
  readonly closed = output<void>();

  protected close(): void {
    this.closed.emit();
  }
}
