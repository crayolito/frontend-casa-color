import { A11yModule } from '@angular/cdk/a11y';
import { Component, output, signal } from '@angular/core';

@Component({
  selector: 'app-search-overlay',
  imports: [A11yModule],
  templateUrl: './search-overlay.html',
  styleUrl: './search-overlay.css',
})
export class SearchOverlay {
  readonly closed = output<void>();

  protected readonly query = signal('');

  protected close(): void {
    this.closed.emit();
  }

  protected onQueryInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.query.set(target.value);
  }

  protected onSubmit(event: Event): void {
    event.preventDefault();
  }
}
