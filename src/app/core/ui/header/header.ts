import { DOCUMENT } from '@angular/common';
import {
  Component,
  DestroyRef,
  HostListener,
  inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';
import {
  MOBILE_NAV_ITEMS,
  NAV_ITEMS,
  NavItem,
} from '../../../shared/util/data/home-data';
import { MobileMenu } from '../mobile-menu/mobile-menu';
import { SearchOverlay } from '../search-overlay/search-overlay';

@Component({
  selector: 'app-header',
  imports: [SearchOverlay, MobileMenu],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit, OnDestroy {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  protected readonly navItems = NAV_ITEMS;
  protected readonly mobileItems = MOBILE_NAV_ITEMS;
  protected readonly scrolled = signal(false);
  protected readonly searchOpen = signal(false);
  protected readonly mobileOpen = signal(false);
  protected readonly openMega = signal<string | null>(null);

  private lastFocused: HTMLElement | null = null;
  private hoverTimer: ReturnType<typeof setTimeout> | null = null;

  ngOnInit(): void {
    this.updateScrolled();
    fromEvent(this.document.defaultView ?? window, 'scroll', { passive: true })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.updateScrolled());
  }

  ngOnDestroy(): void {
    this.clearHoverTimer();
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.searchOpen()) {
      this.closeSearch();
      return;
    }
    if (this.mobileOpen()) {
      this.closeMobile();
      return;
    }
    this.openMega.set(null);
  }

  protected toggleMega(item: NavItem): void {
    if (!item.megaMenu) {
      return;
    }
    this.openMega.update((current) => (current === item.label ? null : item.label));
  }

  protected isMegaOpen(item: NavItem): boolean {
    return this.openMega() === item.label;
  }

  /** Hoverintent-like delay; solo tiene efecto visual en desktop (≥1000px). */
  protected onItemEnter(item: NavItem): void {
    if (!item.megaMenu || !this.isDesktop()) {
      return;
    }
    this.clearHoverTimer();
    this.hoverTimer = setTimeout(() => {
      this.openMega.set(item.label);
    }, 100);
  }

  protected onItemLeave(): void {
    if (!this.isDesktop()) {
      return;
    }
    this.clearHoverTimer();
    this.hoverTimer = setTimeout(() => {
      this.openMega.set(null);
    }, 100);
  }

  protected openSearch(trigger: EventTarget | null): void {
    this.lastFocused = trigger instanceof HTMLElement ? trigger : null;
    this.openMega.set(null);
    this.searchOpen.set(true);
    this.lockScroll(true);
  }

  protected closeSearch(): void {
    this.searchOpen.set(false);
    this.lockScroll(false);
    this.lastFocused?.focus();
    this.lastFocused = null;
  }

  protected openMobile(trigger: EventTarget | null): void {
    this.lastFocused = trigger instanceof HTMLElement ? trigger : null;
    this.openMega.set(null);
    this.mobileOpen.set(true);
    this.lockScroll(true);
  }

  protected closeMobile(): void {
    this.mobileOpen.set(false);
    this.lockScroll(false);
    this.lastFocused?.focus();
    this.lastFocused = null;
  }

  private isDesktop(): boolean {
    return (this.document.defaultView?.innerWidth ?? 0) >= 1000;
  }

  private clearHoverTimer(): void {
    if (this.hoverTimer) {
      clearTimeout(this.hoverTimer);
      this.hoverTimer = null;
    }
  }

  private updateScrolled(): void {
    const y = this.document.defaultView?.scrollY ?? 0;
    this.scrolled.set(y > 24);
  }

  private lockScroll(locked: boolean): void {
    this.document.body.style.overflow = locked ? 'hidden' : '';
  }
}
