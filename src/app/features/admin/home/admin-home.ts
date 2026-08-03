import {
  Component,
  ChangeDetectionStrategy,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
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
import { forkJoin, merge } from 'rxjs';
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
import { resolveErrorMessage } from '../../../shared/errors/resolve-error-message';
import { AdminPageHeader } from '../../../shared/admin-ui/admin-page-header/admin-page-header';
import { AdminButton } from '../../../shared/admin-ui/admin-button/admin-button';
import { AdminTabs, AdminTab } from '../../../shared/admin-ui/admin-tabs/admin-tabs';
import { AdminFormField } from '../../../shared/admin-ui/admin-form-field/admin-form-field';
import { AdminToastService } from '../../../shared/admin-ui/admin-toast/admin-toast.service';
import { AdminFormContext } from '../../../shared/admin-ui/admin-form-context/admin-form-context';
import { AdminModal } from '../../../shared/admin-ui/admin-modal/admin-modal';
import { ImageUploader } from '../../../shared/admin-ui/image-uploader/image-uploader';
import { AdminIcon } from '../../../shared/admin-ui/icons/admin-icon';
import { AdminIconButton } from '../../../shared/admin-ui/admin-icon-button/admin-icon-button';
import { AdminSwitch } from '../../../shared/admin-ui/admin-switch/admin-switch';
import { DestinationPicker } from './destination-picker/destination-picker';
import { NavDestinationPicker } from './nav-destination-picker/nav-destination-picker';
import { SelectOption } from '../../../shared/ui/select/select';

const MAX_HOME_CATEGORIES = 4;
const MIN_SLIDES = 1;
const MAX_SLIDES = 5;

const TEXT_POSITION_OPTIONS: SelectOption[] = [
  { value: 'top', label: 'Arriba' },
  { value: 'middle', label: 'Medio' },
  { value: 'bottom', label: 'Abajo' },
];

const SCHEME_OPTIONS: SelectOption[] = [
  { value: 'dark', label: 'Normal (recomendado)' },
  { value: 'light', label: 'Suave' },
];

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
    AdminModal,
    ImageUploader,
    AdminIcon,
    AdminIconButton,
    AdminSwitch,
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
  private readonly formCtx = inject(AdminFormContext);
  private readonly destroyRef = inject(DestroyRef);

  readonly maxCategories = MAX_HOME_CATEGORIES;
  readonly minSlides = MIN_SLIDES;
  readonly maxSlides = MAX_SLIDES;
  readonly textPositionOptions = TEXT_POSITION_OPTIONS;
  readonly schemeOptions = SCHEME_OPTIONS;

  categoryFormOptions(): SelectOption[] {
    return this.allCategories().map((c) => ({ value: c.id, label: c.name }));
  }

  readonly tabs: AdminTab[] = [
    { id: 'header', label: 'Encabezado' },
    { id: 'nav', label: 'Menú' },
    { id: 'banner', label: 'Carrusel' },
    { id: 'decor', label: 'Decoración' },
    { id: 'categories', label: 'Categorías' },
    { id: 'footer', label: 'Pie de página' },
  ];

  readonly selectedTab = signal('header');
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly allCategories = signal<Category[]>([]);
  readonly content = signal<HomeContent | null>(null);

  readonly slideDestinations = signal<Array<HomeDestination | null>>([]);
  readonly navDestinations = signal<Record<string, HomeNavDestination | null>>({});

  /** Acordeón solo en menú (nav). */
  readonly expandedCards = signal<Set<string>>(new Set());

  readonly slideModalOpen = signal(false);
  readonly slideEditIndex = signal<number | null>(null);
  readonly categoryModalOpen = signal(false);
  readonly categoryEditIndex = signal<number | null>(null);

  private readonly _dirtyTick = signal(0);

  readonly headerForm = this.fb.nonNullable.group({
    imageUrl: [''],
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

  readonly formDirty = computed(() => {
    this._dirtyTick();
    return (
      this.headerForm.dirty ||
      this.bannerForm.dirty ||
      this.findProductForm.dirty ||
      this.categoriesForm.dirty ||
      this.footerForm.dirty ||
      this.socialForm.dirty ||
      this.whatsappForm.dirty ||
      this.navItems.dirty
    );
  });

  get slides(): FormArray<FormGroup> {
    return this.bannerForm.controls.slides;
  }

  get categoryItems(): FormArray<FormGroup> {
    return this.categoriesForm.controls.items;
  }

  slideModalTitle(): string {
    const idx = this.slideEditIndex();
    if (idx === null) return 'Slide';
    const title = String(this.slides.at(idx).controls['title'].value ?? '').trim();
    return title || `Slide ${idx + 1}`;
  }

  categoryModalTitle(): string {
    const idx = this.categoryEditIndex();
    if (idx === null) return 'Categoría';
    return this.categoryName(this.categoryItems.at(idx).controls['categoryId'].value);
  }

  ngOnInit(): void {
    this.formCtx.register(
      {
        dirty: this.formDirty,
        saving: this.saving,
        save: () => this.save(),
        discard: () => this.discardChanges(),
      },
      this.destroyRef,
    );

    merge(
      this.headerForm.valueChanges,
      this.bannerForm.valueChanges,
      this.findProductForm.valueChanges,
      this.categoriesForm.valueChanges,
      this.footerForm.valueChanges,
      this.socialForm.valueChanges,
      this.whatsappForm.valueChanges,
      this.navItems.valueChanges,
    )
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this._dirtyTick.update((n) => n + 1));

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
    this.homeApi.loadHome().subscribe({
      next: (data) => {
        this.content.set(data);
        this.patchAll(data);
        this.loading.set(false);
      },
      error: (err: unknown) => {
        this.loading.set(false);
        this.content.set(null);
        this.toast.error(resolveErrorMessage(err).text);
      },
    });
  }

  discardChanges(): void {
    this.closeSlideModal();
    this.closeCategoryModal();
    this.load();
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

  openAddSlide(): void {
    if (this.slides.length >= MAX_SLIDES) {
      this.toast.error(`Máximo ${MAX_SLIDES} slides`);
      return;
    }
    this.slides.push(this.createSlideGroup());
    this.slideDestinations.update((list) => [...list, null]);
    this.bannerForm.markAsDirty();
    this._dirtyTick.update((n) => n + 1);
    this.slideEditIndex.set(this.slides.length - 1);
    this.slideModalOpen.set(true);
  }

  openEditSlide(index: number): void {
    this.slideEditIndex.set(index);
    this.slideModalOpen.set(true);
  }

  closeSlideModal(): void {
    this.slideModalOpen.set(false);
    this.slideEditIndex.set(null);
  }

  removeSlide(index: number): void {
    if (this.slides.length <= MIN_SLIDES) {
      this.toast.error(`Mínimo ${MIN_SLIDES} slide`);
      return;
    }
    if (this.slideEditIndex() === index) this.closeSlideModal();
    this.slides.removeAt(index);
    this.slideDestinations.update((list) => list.filter((_, i) => i !== index));
    this.bannerForm.markAsDirty();
    this._dirtyTick.update((n) => n + 1);
  }

  dropSlide(event: CdkDragDrop<FormGroup[]>): void {
    moveItemInArray(this.slides.controls, event.previousIndex, event.currentIndex);
    this.slideDestinations.update((list) => {
      const next = [...list];
      moveItemInArray(next, event.previousIndex, event.currentIndex);
      return next;
    });
    this.bannerForm.markAsDirty();
    this._dirtyTick.update((n) => n + 1);
  }

  setSlideImage(index: number, url: string | null): void {
    this.slides.at(index).patchValue({ imageUrl: url ?? '' });
    this.slides.at(index).markAsDirty();
    this.bannerForm.markAsDirty();
    this._dirtyTick.update((n) => n + 1);
  }

  setSlideDestination(index: number, dest: HomeDestination | null): void {
    this.slideDestinations.update((list) => {
      const next = [...list];
      next[index] = dest;
      return next;
    });
    this.bannerForm.markAsDirty();
    this._dirtyTick.update((n) => n + 1);
  }

  openAddCategory(): void {
    if (this.categoryItems.length >= MAX_HOME_CATEGORIES) {
      this.toast.error(`Máximo ${MAX_HOME_CATEGORIES} categorías en el home`);
      return;
    }
    const first = this.allCategories()[0];
    this.categoryItems.push(
      this.createCategoryItemGroup(first?.id ?? 1, this.categoryItems.length),
    );
    this.categoriesForm.markAsDirty();
    this._dirtyTick.update((n) => n + 1);
    this.categoryEditIndex.set(this.categoryItems.length - 1);
    this.categoryModalOpen.set(true);
  }

  openEditCategory(index: number): void {
    this.categoryEditIndex.set(index);
    this.categoryModalOpen.set(true);
  }

  closeCategoryModal(): void {
    this.categoryModalOpen.set(false);
    this.categoryEditIndex.set(null);
  }

  removeCategoryItem(index: number): void {
    if (this.categoryEditIndex() === index) this.closeCategoryModal();
    this.categoryItems.removeAt(index);
    this.categoriesForm.markAsDirty();
    this._dirtyTick.update((n) => n + 1);
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
    this.categoriesForm.markAsDirty();
    this._dirtyTick.update((n) => n + 1);
  }

  setHeaderImage(url: string | null): void {
    this.headerForm.patchValue({ imageUrl: url ?? '' });
    this.headerForm.markAsDirty();
    this._dirtyTick.update((n) => n + 1);
  }

  setFindProductDecorImage(url: string | null): void {
    this.findProductForm.patchValue({ decorImageUrl: url ?? '' });
    this.findProductForm.markAsDirty();
    this._dirtyTick.update((n) => n + 1);
  }

  setFooterTopImage(url: string | null): void {
    this.footerForm.patchValue({ topImageUrl: url ?? '' });
    this.footerForm.markAsDirty();
    this._dirtyTick.update((n) => n + 1);
  }

  setFooterLogo(url: string | null): void {
    this.footerForm.patchValue({ logoUrl: url ?? '' });
    this.footerForm.markAsDirty();
    this._dirtyTick.update((n) => n + 1);
  }

  categoryName(categoryId: unknown): string {
    const id = Number(categoryId);
    return this.allCategories().find((c) => c.id === id)?.name ?? `Categoría #${id}`;
  }

  navChildren(itemIndex: number): FormArray<FormGroup> {
    return this.navItems.at(itemIndex).get('children') as FormArray<FormGroup>;
  }

  addNavItem(): void {
    this.navItems.push(this.createNavItemGroup());
    const idx = this.navItems.length - 1;
    this.expandedCards.update((set) => new Set(set).add(`n-${idx}`));
    this.navItems.markAsDirty();
    this._dirtyTick.update((n) => n + 1);
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
    this.navItems.markAsDirty();
    this._dirtyTick.update((n) => n + 1);
  }

  dropNavItem(event: CdkDragDrop<FormGroup[]>): void {
    moveItemInArray(this.navItems.controls, event.previousIndex, event.currentIndex);
    this.navItems.markAsDirty();
    this._dirtyTick.update((n) => n + 1);
  }

  addNavChild(itemIndex: number): void {
    this.navChildren(itemIndex).push(this.createNavSubItemGroup());
    this.navItems.markAsDirty();
    this._dirtyTick.update((n) => n + 1);
  }

  removeNavChild(itemIndex: number, childIndex: number): void {
    this.navChildren(itemIndex).removeAt(childIndex);
    this.navDestinations.update((map) => {
      const next = { ...map };
      delete next[`${itemIndex}-${childIndex}`];
      return next;
    });
    this.navItems.markAsDirty();
    this._dirtyTick.update((n) => n + 1);
  }

  setNavDestination(key: string, dest: HomeNavDestination | null): void {
    this.navDestinations.update((map) => ({ ...map, [key]: dest }));
    this.navItems.markAsDirty();
    this._dirtyTick.update((n) => n + 1);
  }

  navDest(key: string): HomeNavDestination | null {
    return this.navDestinations()[key] ?? null;
  }

  save(): void {
    const wa = this.whatsappForm.getRawValue();
    if (wa.enabled && !/^\d{6,15}$/.test(wa.phone.trim())) {
      this.toast.error('El teléfono debe ser solo dígitos (6-15) con código de país');
      return;
    }
    if (this.slides.length < MIN_SLIDES) {
      this.toast.error(`Agregá al menos ${MIN_SLIDES} slide con imagen`);
      return;
    }
    if (this.slides.length > MAX_SLIDES) {
      this.toast.error(`Máximo ${MAX_SLIDES} slides`);
      return;
    }
    const invalidSlide = this.slides.controls.some(
      (c) => !String(c.value.imageUrl ?? '').trim(),
    );
    if (invalidSlide) {
      this.toast.error('Cada slide necesita una imagen');
      return;
    }
    const intervalMs = Math.round(Number(this.bannerForm.getRawValue().intervalMs));
    if (!Number.isFinite(intervalMs) || intervalMs < 1000 || intervalMs > 60_000) {
      this.toast.error('El intervalo debe ser entre 1000 y 60000 ms');
      return;
    }
    if (this.categoryItems.length > MAX_HOME_CATEGORIES) {
      this.toast.error(`Máximo ${MAX_HOME_CATEGORIES} categorías en el home`);
      return;
    }

    const header = this.headerForm.getRawValue();
    const banner = this.bannerForm.getRawValue();
    const dests = this.slideDestinations();
    const find = this.findProductForm.getRawValue();
    const existingFind = this.content()?.findProduct;
    const cats = this.categoriesForm.getRawValue();

    this.saveMany([
      {
        section: 'header',
        body: { imageUrl: header.imageUrl.trim() || undefined, link: '/' },
      },
      { section: 'nav', body: { items: this.buildNavPayload() } },
      {
        section: 'banner',
        body: {
          autoplay: Boolean(banner.autoplay),
          intervalMs,
          slides: banner.slides.map((s, i) => ({
            id: String(s['id']),
            imageUrl: String(s['imageUrl'] ?? '').trim(),
            title: String(s['title'] ?? '').trim() || undefined,
            buttonText: String(s['buttonText'] ?? '').trim() || undefined,
            buttonDestination: dests[i] ?? undefined,
            textPosition: s['textPosition'] || 'top',
            scheme: s['scheme'] || 'dark',
          })),
        },
      },
      {
        section: 'find-product',
        body: {
          title: find.title || existingFind?.title || 'Encuentra un producto',
          imageUrl: existingFind?.imageUrl,
          decorImageUrl: find.decorImageUrl.trim() || undefined,
          buttonText: existingFind?.buttonText,
          buttonDestination: existingFind?.buttonDestination,
        },
      },
      {
        section: 'categories',
        body: {
          title: cats.title,
          items: cats.items.map((item, index) => ({
            categoryId: Number(item['categoryId']),
            displayOrder: index,
            description: item['description'] || undefined,
          })),
        },
      },
      { section: 'footer', body: this.buildFooterPayload() },
      {
        section: 'floating',
        body: {
          whatsapp: {
            enabled: wa.enabled,
            phone: wa.phone.trim(),
            message: wa.message.trim(),
          },
        },
      },
    ]);
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

  private saveMany(
    items: Array<{ section: HomeSection; body: Record<string, unknown> }>,
  ): void {
    this.saving.set(true);
    forkJoin(
      items.map((item) => this.homeApi.upsertSection(item.section, item.body)),
    ).subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.success('Guardado correctamente');
        this.closeSlideModal();
        this.closeCategoryModal();
        this.load();
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.toast.error(resolveErrorMessage(err).text);
      },
    });
  }

  private patchAll(data: HomeContent): void {
    const header = data.header as HomeContent['header'] & {
      logo?: { imageUrl?: string; altText?: string };
    };
    this.headerForm.patchValue({
      imageUrl: header.imageUrl || header.logo?.imageUrl || '',
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

    this.headerForm.markAsPristine();
    this.bannerForm.markAsPristine();
    this.findProductForm.markAsPristine();
    this.categoriesForm.markAsPristine();
    this.footerForm.markAsPristine();
    this.socialForm.markAsPristine();
    this.whatsappForm.markAsPristine();
    this.navItems.markAsPristine();
    this._dirtyTick.update((n) => n + 1);
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
  ): FormGroup {
    return this.fb.nonNullable.group({
      categoryId: [categoryId, Validators.required],
      displayOrder: [displayOrder],
      description: [description],
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
