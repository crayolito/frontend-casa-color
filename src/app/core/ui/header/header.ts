import { DOCUMENT } from '@angular/common';
import {
  Component,
  DestroyRef,
  HostListener,
  computed,
  inject,
  input,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { fromEvent } from 'rxjs';
import {
  MOBILE_NAV_ITEMS,
  NAV_ITEMS,
  MobileNavItem,
  NavItem,
} from '../../../shared/util/data/nav-data';
import {
  HomeLogo,
  HomeNavItem,
  HomeResolvedCategory,
  navDestinationHref,
} from '../../../features/home/data/home-content.model';
import { withLogoFallback } from '../../../shared/util/default-images';
import { MobileMenu } from '../mobile-menu/mobile-menu';
import { SearchOverlay } from '../search-overlay/search-overlay';
import { ImgFallback } from '../../../shared/util/img-fallback/img-fallback';

@Component({
  selector: 'app-header',
  imports: [SearchOverlay, MobileMenu, ImgFallback],
  templateUrl: './header.html',
  styleUrl: './header.css',
})
export class Header implements OnInit, OnDestroy {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  /** Logo configurable (home). Si no viene, usa el logo por defecto. */
  readonly logo = input<HomeLogo | null>(null);
  /** Categorías del home para el autocomplete de búsqueda. */
  readonly searchCategories = input<HomeResolvedCategory[]>([]);
  /** Menú dinámico desde admin. Si vacío/null, usa NAV_ITEMS legacy. */
  readonly dynamicNav = input<HomeNavItem[] | null>(null);

  protected readonly scrolled = signal(false);
  protected readonly searchOpen = signal(false);
  protected readonly mobileOpen = signal(false);
  protected readonly openSub = signal<string | null>(null);

  protected readonly navItems = computed((): NavItem[] => {
    const items = this.dynamicNav();
    if (!items?.length) return NAV_ITEMS;
    return items.map((item) => this.toNavItem(item));
  });

  protected readonly mobileItems = computed((): MobileNavItem[] => {
    const items = this.dynamicNav();
    if (!items?.length) return MOBILE_NAV_ITEMS;
    return items.map((item) => this.toMobileNavItem(item));
  });

  private lastFocused: HTMLElement | null = null;
  private hoverTimer: ReturnType<typeof setTimeout> | null = null;

  protected logoSrc(): string {
    const logo = this.logo();
    if (logo?.type === 'image' && logo.imageUrl) {
      return withLogoFallback(logo.imageUrl);
    }
    if (logo?.imageUrl) {
      return withLogoFallback(logo.imageUrl);
    }
    return withLogoFallback(null);
  }

  protected logoAlt(): string {
    return this.logo()?.altText || 'Casa Color';
  }

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
    this.openSub.set(null);
  }

  protected toggleItem(item: NavItem): void {
    if (!item.children?.length) {
      return;
    }
    this.openSub.update((current) => (current === item.label ? null : item.label));
  }

  protected isItemOpen(item: NavItem): boolean {
    return this.openSub() === item.label;
  }

  protected onItemEnter(item: NavItem): void {
    if (!item.children?.length || !this.isDesktop()) {
      return;
    }
    this.clearHoverTimer();
    this.hoverTimer = setTimeout(() => {
      this.openSub.set(item.label);
    }, 100);
  }

  protected onItemLeave(): void {
    if (!this.isDesktop()) {
      return;
    }
    this.clearHoverTimer();
    this.hoverTimer = setTimeout(() => {
      this.openSub.set(null);
    }, 100);
  }

  protected openSearch(trigger: EventTarget | null): void {
    this.lastFocused = trigger instanceof HTMLElement ? trigger : null;
    this.openSub.set(null);
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
    this.openSub.set(null);
    this.mobileOpen.set(true);
    this.lockScroll(true);
  }

  protected closeMobile(): void {
    this.mobileOpen.set(false);
    this.lockScroll(false);
    this.lastFocused?.focus();
    this.lastFocused = null;
  }

  private toNavItem(item: HomeNavItem): NavItem {
    const href = navDestinationHref(item.destination);
    const children = (item.children ?? [])
      .filter((c) => !!c.label)
      .map((c) => ({
        label: c.label,
        href: navDestinationHref(c.destination),
      }));
    return {
      label: item.label,
      href,
      children: children.length ? children : undefined,
    };
  }

  private toMobileNavItem(item: HomeNavItem): MobileNavItem {
    const href = navDestinationHref(item.destination);
    const children = (item.children ?? [])
      .filter((c) => !!c.label)
      .map((c) => ({
        label: c.label,
        href: navDestinationHref(c.destination),
      }));
    return {
      label: item.label,
      href: children.length ? undefined : href,
      children: children.length ? children : undefined,
    };
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
