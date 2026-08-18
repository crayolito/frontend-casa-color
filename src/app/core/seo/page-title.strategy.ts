import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

const SITE_NAME = 'CasaColor';

/** Arma el document.title desde route.data['title'] → "Título | CasaColor". */
@Injectable()
export class PageTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const pageTitle = this.buildTitle(snapshot);
    if (pageTitle) {
      this.title.setTitle(`${pageTitle} | ${SITE_NAME}`);
      return;
    }
    this.title.setTitle(SITE_NAME);
  }
}
