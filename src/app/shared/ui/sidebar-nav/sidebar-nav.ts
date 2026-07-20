import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

export interface SidebarLink {
  label: string;
  href: string;
  current?: boolean;
}

export interface SidebarGroup {
  title: string;
  links: SidebarLink[];
}

@Component({
  selector: 'app-sidebar-nav',
  imports: [RouterLink],
  templateUrl: './sidebar-nav.html',
  styleUrl: './sidebar-nav.css',
})
export class SidebarNav {
  readonly groups = input.required<SidebarGroup[]>();
}
