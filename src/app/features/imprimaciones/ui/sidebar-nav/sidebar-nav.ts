import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SidebarGroup } from '../../util/imprimaciones-data';

@Component({
  selector: 'app-sidebar-nav',
  imports: [RouterLink],
  templateUrl: './sidebar-nav.html',
  styleUrl: './sidebar-nav.css',
})
export class SidebarNav {
  readonly groups = input.required<SidebarGroup[]>();
}
