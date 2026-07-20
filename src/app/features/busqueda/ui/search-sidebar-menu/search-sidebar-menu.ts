import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NAV_ITEMS, NavItem } from '../../../../shared/util/data/home-data';

@Component({
  selector: 'app-search-sidebar-menu',
  imports: [RouterLink],
  templateUrl: './search-sidebar-menu.html',
  styleUrl: './search-sidebar-menu.css',
})
export class SearchSidebarMenu {
  protected readonly items: NavItem[] = NAV_ITEMS;

  protected isInternal(href: string): boolean {
    return href.startsWith('/') && !href.startsWith('/#');
  }
}
