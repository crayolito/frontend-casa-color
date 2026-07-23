import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { inject } from '@angular/core';
import { sanitizeHtml } from '../util/sanitize-html';

/** Sanitiza con DOMPurify y marca como SafeHtml para [innerHTML]. */
@Pipe({ name: 'safeHtml', pure: true })
export class SafeHtmlPipe implements PipeTransform {
  private readonly sanitizer = inject(DomSanitizer);

  transform(value: string | null | undefined): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(sanitizeHtml(value ?? ''));
  }
}
