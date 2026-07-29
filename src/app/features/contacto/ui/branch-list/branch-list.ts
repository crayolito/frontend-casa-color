import { Component, input, output } from '@angular/core';
import { BranchWithDistance } from '../../data/contacto.models';

@Component({
  selector: 'app-branch-list',
  templateUrl: './branch-list.html',
  styleUrl: './branch-list.css',
})
export class BranchList {
  readonly branches = input.required<BranchWithDistance[]>();
  readonly selectedId = input<number | null>(null);
  readonly select = output<number>();

  protected formatDistance(km: number | null): string | null {
    if (km === null) {
      return null;
    }
    if (km < 1) {
      return `${Math.round(km * 1000)} m`;
    }
    return `${km.toFixed(1)} km`;
  }

  protected onSelect(id: number): void {
    this.select.emit(id);
  }
}
