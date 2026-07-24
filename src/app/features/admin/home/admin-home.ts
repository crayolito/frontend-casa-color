import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import { HomeApi } from '../../home/data/home.api';
import {
  HomeContent,
  HomeDestination,
  HomeNavDestination,
  HomeNavItem,
  HomeSection,
} from '../../home/data/home-content.model';
import { CategoriesApi } from '../data/categories.api';
import { Category } from '../data/admin.models';
import {
  ResolvedErrorMessage,
  resolveErrorMessage,
} from '../../../shared/errors/resolve-error-message';
import { AdminPageHeader } from '../../../shared/admin-ui/admin-page-header/admin-page-header';
import { AdminButton } from '../../../shared/admin-ui/admin-button/admin-button';
import { AdminTabs, AdminTab } from '../../../shared/admin-ui/admin-tabs/admin-tabs';
import { AdminFormField } from '../../../shared/admin-ui/admin-form-field/admin-form-field';
import { AdminErrorState } from '../../../shared/admin-ui/admin-error-state/admin-error-state';
import { AdminToastService } from '../../../shared/admin-ui/admin-toast/admin-toast.service';
import { ImageUploader } from '../../../shared/admin-ui/image-uploader/image-uploader';
import { AdminIcon } from '../../../shared/admin-ui/icons/admin-icon';
import { DestinationPicker } from './destination-picker/destination-picker';
import { NavDestinationPicker } from './nav-destination-picker/nav-destination-picker';

const MAX_HOME_CATEGORIES = 4;

@Component({
  selector: 'app-admin-home',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    DragDropModule,
    AdminPageHeader,
    AdminButton,
    AdminTabs,
    AdminFormField,
    AdminErrorState,
    ImageUploader,
    AdminIcon,
    DestinationPicker,
    NavDestinationPicker,
  ],
  templateUrl: './admin-home.html',
  styleUrl: './admin-home.css',
})
export class AdminHome implements OnInit {
  private readonly homeApi = inject(HomeApi);
  private readonly categoriesApi = inject(CategoriesApi);
  private readonly fb = inject(FormBuilder);
  private readonly toast = inject(AdminToastService);

  readonly maxCategories = MAX_HOME_CATEGORIES;

  readonly tabs: AdminTab[] = [
    { id: 'header', label: 'Logo' },
    { id: 'header-nav', label: 'Menú superior' },
    { id: 'banner', label: 'Carrusel' },
    { id: 'decor', label: 'Decoración' },
    { id: 'find-product', label: 'Encontrá tu producto' },
    { id: 'categories', label: 'Categorías' },
    { id: 'footer', label: 'Pie de página' },
    { id: 'social', label: 'Redes' },
    { id: 'whatsapp', label: 'WhatsApp' },
  ];

  readonly selectedTab = signal('header');
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<ResolvedErrorMessage | null>(null);
  readonly allCategories = signal<Category[]>([]);
  readonly content = signal<HomeContent | null>(null);

  readonly slideDestinations = signal<Array<HomeDestination | null>>([]);

  /** Destinos del menú (itemIndex → dest; 'i-j' para subitem). */
  readonly navDestinations = signal<Record<string, HomeNavDestination | null>>({});

  /** Tarjetas expandibles en admin (slides / categorías / nav). Prefijo: s-|c-|n- */
  readonly expandedCards = signal<Set<string>>(new Set());

  readonly headerForm = this.fb.nonNullable.group({
    imageUrl: [''],
    link: ['/'],
  });

  readonly bannerForm = this.fb.nonNullable.group({
    autoplay: [true],
    intervalMs: [4000, [Validators.required, Validators.min(1000)]],
    slides: this.fb.array<FormGroup>([]),
  });

  readonly findProductForm = this.fb.nonNullable.group({
    title: ['', Validators.required],
    decorImageUrl: [''],
  });

  readonly categoriesForm = this.fb.nonNullable.group({
    title: [''],
    items: this.fb.array<FormGroup>([]),
  });

  readonly footerForm = this.fb.nonNullable.group({
    topImageUrl: [''],
    logoUrl: [''],
    copyrightText: ['', Validators.required],
    designBy: ['Crayolito', Validators.required],
    designByHref: [''],
  });

  readonly socialForm = this.fb.nonNullable.group({
    instagramUrl: [''],
    instagramShow: [false],
    tiktokUrl: [''],
    tiktokShow: [false],
    facebookUrl: [''],
    facebookShow: [false],
  });

  readonly whatsappForm = this.fb.nonNullable.group({
    enabled: [false],
    phone: [''],
    message: ['Hola, quiero información'],
  });

  readonly navItems = this.fb.array<FormGroup>([]);

  get slides(): FormArray<FormGroup> {
    return this.bannerForm.controls.slides;
  }

  get categoryItems(): FormArray<FormGroup> {
    return this.categoriesForm.controls.items;
  }

  ngOnInit(): void {
    this.categoriesApi.list(1, 100).subscribe({
      next: (res) => this.allCategories.set(res.data),
    });
    this.load();
  }

  selectTab(id: string): void {
    this.selectedTab.set(id);
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.homeApi.loadHome().subscribe({
      next: (data) => {
        this.content.set(data);
        this.patchAll(data);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.loading.set(false);
        this.error.set(resolveErrorMessage(err));
      },
    });
  }

  isCardExpanded(key: string): boolean {
    return this.expandedCards().has(key);
  }

  toggleCard(key: string, event?: Event): void {
    event?.stopPropagation();
    this.expandedCards.update((set) => {
      const next = new Set(set);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  addSlide(): void {
    this.slides.push(this.createSlideGroup());
    this.slideDestinations.update((list) => [...list, null]);
    const idx = this.slides.length - 1;
    this.expandedCards.update((set) => new Set(set).add(`s-${idx}`));
  }

  removeSlide(index: number): void {
    this.slides.removeAt(index);
    this.slideDestinations.update((list) => list.filter((_, i) => i !== index));
  }

  dropSlide(event: CdkDragDrop<FormGroup[]>): void {
    moveItemInArray(this.slides.controls, event.previousIndex, event.currentIndex);
    this.slideDestinations.update((list) => {
      const next = [...list];
      moveItemInArray(next, event.previousIndex, event.currentIndex);
      return next;
    });
  }

  setSlideImage(index: number, url: string | null): void {
    this.slides.at(index).patchValue({ imageUrl: url ?? '' });
  }

  setSlideDestination(index: number, dest: HomeDestination | null): void {
    this.slideDestinations.update((list) => {
      const next = [...list];
      next[index] = dest;
      return next;
    });
  }

  addCategoryItem(): void {
    if (this.categoryItems.length >= MAX_HOME_CATEGORIES) {
      this.toast.error(`Máximo ${MAX_HOME_CATEGORIES} categorías en el home`);
      return;
    }
    const first = this.allCategories()[0];
    this.categoryItems.push(
      this.createCategoryItemGroup(first?.id ?? 1, this.categoryItems.length),
    );
    const idx = this.categoryItems.length - 1;
    this.expandedCards.update((set) => new Set(set).add(`c-${idx}`));
  }

  removeCategoryItem(index: number): void {
    this.categoryItems.removeAt(index);
  }

  dropCategory(event: CdkDragDrop<FormGroup[]>): void {
    moveItemInArray(
      this.categoryItems.controls,
      event.previousIndex,
      event.currentIndex,
    );
    this.categoryItems.controls.forEach((c, i) =>
      c.patchValue({ displayOrder: i }),
    );
  }

  setCategoryImage(index: number, url: string | null): void {
    this.categoryItems.at(index).patchValue({ imageUrl: url ?? '' });
  }

  setHeaderImage(url: string | null): void {
    this.headerForm.patchValue({ imageUrl: url ?? '' });
  }

  setFindProductDecorImage(url: string | null): void {
    this.findProductForm.patchValue({ decorImageUrl: url ?? '' });
  }

  setFooterTopImage(url: string | null): void {
    this.footerForm.patchValue({ topImageUrl: url ?? '' });
  }

  setFooterLogo(url: string | null): void {
    this.footerForm.patchValue({ logoUrl: url ?? '' });
  }

  categoryName(categoryId: unknown): string {
    const id = Number(categoryId);
    return this.allCategories().find((c) => c.id === id)?.name ?? `Categoría #${id}`;
  }

  // --- Nav menu ---

  navChildren(itemIndex: number): FormArray<FormGroup> {
    return this.navItems.at(itemIndex).get('children') as FormArray<FormGroup>;
  }

  addNavItem(): void {
    this.navItems.push(this.createNavItemGroup());
    const idx = this.navItems.length - 1;
    this.expandedCards.update((set) => new Set(set).add(`n-${idx}`));
  }

  removeNavItem(index: number): void {
    this.navItems.removeAt(index);
    this.navDestinations.update((map) => {
      const next: Record<string, HomeNavDestination | null> = {};
      for (const [k, v] of Object.entries(map)) {
        if (k === String(index) || k.startsWith(`${index}-`)) continue;
        next[k] = v;
      }
      return next;
    });
  }

  dropNavItem(event: CdkDragDrop<FormGroup[]>): void {
    moveItemInArray(this.navItems.controls, event.previousIndex, event.currentIndex);
  }

  addNavChild(itemIndex: number): void {
    this.navChildren(itemIndex).push(this.createNavSubItemGroup());
  }

  removeNavChild(itemIndex: number, childIndex: number): void {
    this.navChildren(itemIndex).removeAt(childIndex);
    this.navDestinations.update((map) => {
      const next = { ...map };
      delete next[`${itemIndex}-${childIndex}`];
      return next;
    });
  }

  setNavDestination(key: string, dest: HomeNavDestination | null): void {
    this.navDestinations.update((map) => ({ ...map, [key]: dest }));
  }

  navDest(key: string): HomeNavDestination | null {
    return this.navDestinations()[key] ?? null;
  }

  saveCurrent(): void {
    const tab = this.selectedTab();
    if (tab === 'social' || tab === 'footer') {
      this.saveSection('footer', this.buildFooterPayload());
      return;
    }
    if (tab === 'whatsapp') {
      const v = this.whatsappForm.getRawValue();
      if (v.enabled && !/^\d{6,15}$/.test(v.phone.trim())) {
        this.toast.error('El teléfono debe ser solo dígitos (6-15) con código de país');
        return;
      }
      this.saveSection('floating', {
        whatsapp: {
          enabled: v.enabled,
          phone: v.phone.trim(),
          message: v.message.trim(),
        },
      });
      return;
    }
    if (tab === 'header') {
      const v = this.headerForm.getRawValue();
      this.saveSection('header', {
        imageUrl: v.imageUrl.trim() || undefined,
        link: v.link || undefined,
      });
      return;
    }
    if (tab === 'header-nav') {
      this.saveSection('nav', { items: this.buildNavPayload() });
      return;
    }
    if (tab === 'banner') {
      if (this.slides.length === 0) {
        this.toast.error('Agregá al menos un slide con imagen');
        return;
      }
      const invalid = this.slides.controls.some(
        (c) => !String(c.value.imageUrl ?? '').trim(),
      );
      if (invalid) {
        this.toast.error('Cada slide necesita una imagen');
        return;
      }
      const v = this.bannerForm.getRawValue();
      const dests = this.slideDestinations();
      this.saveSection('banner', {
        autoplay: v.autoplay,
        intervalMs: Number(v.intervalMs),
        slides: v.slides.map((s, i) => ({
          id: s['id'],
          imageUrl: s['imageUrl'],
          title: s['title'] || undefined,
          buttonText: s['buttonText'] || undefined,
          buttonDestination: dests[i] ?? undefined,
          textPosition: s['textPosition'] || 'top',
          scheme: s['scheme'] || 'dark',
        })),
      });
      return;
    }
    if (tab === 'decor') {
      const existing = this.content()?.findProduct;
      const decor = this.findProductForm.controls.decorImageUrl.value.trim();
      this.saveSection('find-product', {
        title: existing?.title || 'Encuentra un producto',
        imageUrl: existing?.imageUrl,
        decorImageUrl: decor || undefined,
        buttonText: existing?.buttonText,
        buttonDestination: existing?.buttonDestination,
      });
      return;
    }
    if (tab === 'find-product') {
      const existing = this.content()?.findProduct;
      const v = this.findProductForm.getRawValue();
      this.saveSection('find-product', {
        title: v.title,
        imageUrl: existing?.imageUrl,
        decorImageUrl: existing?.decorImageUrl ?? (v.decorImageUrl || undefined),
        buttonText: existing?.buttonText,
        buttonDestination: existing?.buttonDestination,
      });
      return;
    }
    if (tab === 'categories') {
      if (this.categoryItems.length > MAX_HOME_CATEGORIES) {
        this.toast.error(`Máximo ${MAX_HOME_CATEGORIES} categorías en el home`);
        return;
      }
      const v = this.categoriesForm.getRawValue();
      this.saveSection('categories', {
        title: v.title,
        items: v.items.map((item, index) => ({
          categoryId: Number(item['categoryId']),
          displayOrder: index,
          description: item['description'] || undefined,
          imageUrl: item['imageUrl'] || undefined,
        })),
      });
    }
  }

  private buildNavPayload(): HomeNavItem[] {
    const dests = this.navDestinations();
    return this.navItems.controls.map((ctrl, i) => {
      const v = ctrl.getRawValue() as {
        id: string;
        label: string;
        children: Array<{ id: string; label: string }>;
      };
      return {
        id: v.id,
        label: v.label,
        destination: dests[String(i)] ?? undefined,
        children: (v.children ?? []).map((ch, j) => ({
          id: ch.id,
          label: ch.label,
          destination: dests[`${i}-${j}`] ?? undefined,
        })),
      };
    });
  }

  private buildFooterPayload(): Record<string, unknown> {
    const f = this.footerForm.getRawValue();
    const s = this.socialForm.getRawValue();
    const current = this.content()?.footer;
    return {
      topImageUrl: f.topImageUrl || undefined,
      logoUrl: f.logoUrl || undefined,
      address: current?.address ?? [],
      phones: current?.phones ?? [],
      legalLinks: current?.legalLinks ?? [],
      social: {
        instagram: { url: s.instagramUrl, show: s.instagramShow },
        tiktok: { url: s.tiktokUrl, show: s.tiktokShow },
        facebook: { url: s.facebookUrl, show: s.facebookShow },
      },
      copyright: {
        text: f.copyrightText,
        designBy: f.designBy,
        designByHref: f.designByHref || undefined,
      },
    };
  }

  private saveSection(section: HomeSection, body: Record<string, unknown>): void {
    this.saving.set(true);
    this.error.set(null);
    this.homeApi.upsertSection(section, body).subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.success('Sección guardada');
        this.load();
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.error.set(resolveErrorMessage(err));
        this.toast.error('No se pudo guardar');
      },
    });
  }

  private patchAll(data: HomeContent): void {
    const header = data.header as HomeContent['header'] & {
      logo?: { imageUrl?: string; altText?: string };
    };
    this.headerForm.patchValue({
      imageUrl: header.imageUrl || header.logo?.imageUrl || '',
      link: header.link || '/',
    });

    this.slides.clear();
    const dests: Array<HomeDestination | null> = [];
    for (const slide of data.banner.slides) {
      this.slides.push(this.createSlideGroup(slide));
      dests.push(slide.buttonDestination ?? null);
    }
    this.slideDestinations.set(dests);
    this.bannerForm.patchValue({
      autoplay: data.banner.autoplay,
      intervalMs: data.banner.intervalMs,
    });

    this.findProductForm.patchValue({
      title: data.findProduct.title,
      decorImageUrl: data.findProduct.decorImageUrl ?? '',
    });

    this.categoryItems.clear();
    const limited = data.categories.items.slice(0, MAX_HOME_CATEGORIES);
    for (const item of limited) {
      this.categoryItems.push(
        this.createCategoryItemGroup(
          item.categoryId,
          item.displayOrder,
          item.description ?? '',
          item.imageUrl ?? '',
        ),
      );
    }
    this.categoriesForm.patchValue({ title: data.categories.title });

    this.footerForm.patchValue({
      topImageUrl: data.footer.topImageUrl ?? '',
      logoUrl: data.footer.logoUrl ?? '',
      copyrightText: data.footer.copyright.text,
      designBy: data.footer.copyright.designBy,
      designByHref: data.footer.copyright.designByHref ?? '',
    });

    const social = data.footer.social;
    const facebook = social.facebook ?? social.twitter;
    this.socialForm.patchValue({
      instagramUrl: social.instagram?.url ?? '',
      instagramShow: social.instagram?.show ?? false,
      tiktokUrl: social.tiktok?.url ?? '',
      tiktokShow: social.tiktok?.show ?? false,
      facebookUrl: facebook?.url ?? '',
      facebookShow: facebook?.show ?? false,
    });

    this.whatsappForm.patchValue({
      enabled: data.floating?.whatsapp?.enabled ?? false,
      phone: data.floating?.whatsapp?.phone ?? '',
      message: data.floating?.whatsapp?.message ?? 'Hola, quiero información',
    });

    this.navItems.clear();
    const navMap: Record<string, HomeNavDestination | null> = {};
    const navItems = data.nav?.items ?? [];
    for (let i = 0; i < navItems.length; i++) {
      const item = navItems[i];
      this.navItems.push(this.createNavItemGroup(item));
      navMap[String(i)] = item.destination ?? null;
      item.children?.forEach((ch, j) => {
        navMap[`${i}-${j}`] = ch.destination ?? null;
      });
    }
    this.navDestinations.set(navMap);
    this.expandedCards.set(new Set());
  }

  private createSlideGroup(slide?: {
    id?: string;
    imageUrl?: string;
    title?: string;
    buttonText?: string;
    textPosition?: string;
    scheme?: string;
  }): FormGroup {
    return this.fb.nonNullable.group({
      id: [slide?.id ?? crypto.randomUUID()],
      imageUrl: [slide?.imageUrl ?? '', Validators.required],
      title: [slide?.title ?? ''],
      buttonText: [slide?.buttonText ?? ''],
      textPosition: [slide?.textPosition ?? 'top'],
      scheme: [slide?.scheme ?? 'dark'],
    });
  }

  private createCategoryItemGroup(
    categoryId: number,
    displayOrder: number,
    description = '',
    imageUrl = '',
  ): FormGroup {
    return this.fb.nonNullable.group({
      categoryId: [categoryId, Validators.required],
      displayOrder: [displayOrder],
      description: [description],
      imageUrl: [imageUrl],
    });
  }

  private createNavItemGroup(item?: HomeNavItem): FormGroup {
    const children = this.fb.array<FormGroup>(
      (item?.children ?? []).map((ch) => this.createNavSubItemGroup(ch)),
    );
    return this.fb.nonNullable.group({
      id: [item?.id ?? crypto.randomUUID()],
      label: [item?.label ?? '', Validators.required],
      children,
    });
  }

  private createNavSubItemGroup(item?: {
    id?: string;
    label?: string;
  }): FormGroup {
    return this.fb.nonNullable.group({
      id: [item?.id ?? crypto.randomUUID()],
      label: [item?.label ?? '', Validators.required],
    });
  }
}
