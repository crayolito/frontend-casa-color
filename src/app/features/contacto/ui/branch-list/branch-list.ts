import { Component, input, output } from '@angular/core';
import { BranchWithDistance } from '../../util/contacto-data';

@Component({
  selector: 'app-branch-list',
  templateUrl: './branch-list.html',
  styleUrl: './branch-list.css',
})
export class BranchList {
  readonly branches = input.required<BranchWithDistance[]>();
  readonly selectedId = input<string | null>(null);
  readonly select = output<string>();

  protected formatDistance(km: number | null): string | null {
    if (km === null) {
      return null;
    }
    if (km < 1) {
      return `${Math.round(km * 1000)} m`;
    }
    return `${km.toFixed(1)} km`;
  }

  protected onSelect(id: string): void {
    this.select.emit(id);
  }
}
