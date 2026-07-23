import {
  Component,
  ChangeDetectionStrategy,
  input,
  inject,
  computed,
} from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { ADMIN_ICON_PATHS, type AdminIconName } from './admin-icon-paths';

export type { AdminIconName };

@Component({
  selector: 'app-admin-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      [attr.width]="size()"
      [attr.height]="size()"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      [innerHTML]="safePaths()"
    ></svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      line-height: 0;
      color: inherit;
    }
  `,
})
export class AdminIcon {
  private readonly sanitizer = inject(DomSanitizer);

  readonly name = input.required<AdminIconName>();
  readonly size = input(18);

  readonly safePaths = computed<SafeHtml>(() =>
    this.sanitizer.bypassSecurityTrustHtml(ADMIN_ICON_PATHS[this.name()] ?? ''),
  );
}
