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
  FormControl,
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
  HOME_PAGE_OPTIONS,
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
import { AdminHtmlEditor } from '../../../shared/admin-ui/admin-html-editor/admin-html-editor';
import { DestinationPicker } from './destination-picker/destination-picker';
import { NavDestinationPicker } from './nav-destination-picker/nav-destination-picker';
import { AppSelect, SelectOption } from '../../../shared/ui/select/select';

const MAX_HOME_CATEGORIES = 4;
const MIN_SLIDES = 1;
const MAX_SLIDES = 5;
const MIN_NAV_ITEMS = 3;
const MAX_NAV_ITEMS = 7;
const MAX_FOOTER_COLUMN_LINES = 8;
const MAX_FOOTER_COLUMN_LINKS = 8;
const FOOTER_COLUMN_COUNT = 3;
const DEFAULT_FIND_BG = '#dd3333';
const DEFAULT_FIND_TEXT = '#ffffff';
const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

type FooterColumnType = 'text' | 'links' | 'html';

const FOOTER_COLUMN_TYPE_OPTIONS: SelectOption[] = [
  { value: 'text', label: 'Texto / contacto' },
  { value: 'links', label: 'Enlaces a páginas' },
  { value: 'html', label: 'Descripción (HTML)' },
];

const FOOTER_PAGE_OPTIONS: SelectOption[] = HOME_PAGE_OPTIONS.map((p) => ({
  value: p.value,
  label: p.label,
}));

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
    AdminHtmlEditor,
    DestinationPicker,
    NavDestinationPicker,
    AppSelect,
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
  readonly minNavItems = MIN_NAV_ITEMS;
  readonly maxNavItems = MAX_NAV_ITEMS;
  readonly maxFooterColumnLines = MAX_FOOTER_COLUMN_LINES;
  readonly maxFooterColumnLinks = MAX_FOOTER_COLUMN_LINKS;
  readonly footerColumnTypeOptions = FOOTER_COLUMN_TYPE_OPTIONS;
  readonly footerPageOptions = FOOTER_PAGE_OPTIONS;
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
    sectionBgColor: [DEFAULT_FIND_BG, [Validators.pattern(HEX_COLOR)]],
    sectionTextColor: [DEFAULT_FIND_TEXT, [Validators.pattern(HEX_COLOR)]],
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
    widgetsBgColor: [DEFAULT_FIND_BG, [Validators.pattern(HEX_COLOR)]],
    widgetsTextColor: [DEFAULT_FIND_TEXT, [Validators.pattern(HEX_COLOR)]],
  });

  readonly footerColumns = this.fb.array<FormGroup>([]);

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
      this.footerColumns.dirty ||
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
      this.footerColumns.valueChanges,
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

  footerColumn(index: number): FormGroup {
    return this.footerColumns.at(index);
  }

  footerColumnLines(index: number): FormArray<FormControl<string>> {
    return this.footerColumn(index).get('lines') as FormArray<FormControl<string>>;
  }

  footerColumnLinks(index: number): FormArray<FormControl<string>> {
    return this.footerColumn(index).get('links') as FormArray<FormControl<string>>;
  }

  footerColumnType(index: number): FooterColumnType {
    const value = this.footerColumn(index).get('type')?.value;
    if (value === 'links' || value === 'html') return value;
    return 'text';
  }

  setFooterColumnType(index: number, type: string | number | null): void {
    const next: FooterColumnType =
      type === 'links' || type === 'html' ? type : 'text';
    this.footerColumn(index).patchValue({ type: next });
    this.footerColumns.markAsDirty();
    this._dirtyTick.update((n) => n + 1);
  }

  footerColumnHtml(index: number): string {
    return String(this.footerColumn(index).get('html')?.value ?? '');
  }

  setFooterColumnHtml(index: number, html: string): void {
    this.footerColumn(index).patchValue({ html: html ?? '' });
    this.footerColumns.markAsDirty();
    this._dirtyTick.update((n) => n + 1);
  }

  addFooterLine(colIndex: number): void {
    const lines = this.footerColumnLines(colIndex);
    if (lines.length >= MAX_FOOTER_COLUMN_LINES) return;
    lines.push(this.fb.nonNullable.control(''));
    this.footerColumns.markAsDirty();
    this._dirtyTick.update((n) => n + 1);
  }

  removeFooterLine(colIndex: number, lineIndex: number): void {
    const lines = this.footerColumnLines(colIndex);
    if (lines.length <= 1) {
      lines.at(0).setValue('');
    } else {
      lines.removeAt(lineIndex);
    }
    this.footerColumns.markAsDirty();
    this._dirtyTick.update((n) => n + 1);
  }

  addFooterPageLink(colIndex: number): void {
    const links = this.footerColumnLinks(colIndex);
    if (links.length >= MAX_FOOTER_COLUMN_LINKS) return;
    const used = new Set(links.controls.map((c) => c.value));
    const firstFree = HOME_PAGE_OPTIONS.find((p) => !used.has(p.value));
    links.push(this.fb.nonNullable.control(firstFree?.value ?? ''));
    this.footerColumns.markAsDirty();
    this._dirtyTick.update((n) => n + 1);
  }

  removeFooterPageLink(colIndex: number, linkIndex: number): void {
    this.footerColumnLinks(colIndex).removeAt(linkIndex);
    this.footerColumns.markAsDirty();
    this._dirtyTick.update((n) => n + 1);
  }

  setFooterPageLink(
    colIndex: number,
    linkIndex: number,
    page: string | number | null,
  ): void {
    const value = String(page ?? '').trim();
    this.footerColumnLinks(colIndex).at(linkIndex).setValue(value);
    this.footerColumns.markAsDirty();
    this._dirtyTick.update((n) => n + 1);
  }

  pageOptionsForLink(colIndex: number, linkIndex: number): SelectOption[] {
    const links = this.footerColumnLinks(colIndex);
    const current = links.at(linkIndex).value;
    const used = new Set(
      links.controls
        .map((c, i) => (i === linkIndex ? '' : c.value))
        .filter(Boolean),
    );
    return FOOTER_PAGE_OPTIONS.filter(
      (opt) => opt.value === current || !used.has(String(opt.value)),
    );
  }

  categoryName(categoryId: unknown): string {
    const id = Number(categoryId);
    return this.allCategories().find((c) => c.id === id)?.name ?? `Categoría #${id}`;
  }

  navChildren(itemIndex: number): FormArray<FormGroup> {
    return this.navItems.at(itemIndex).get('children') as FormArray<FormGroup>;
  }

  addNavItem(): void {
    if (this.navItems.length >= MAX_NAV_ITEMS) {
      this.toast.error(`Máximo ${MAX_NAV_ITEMS} ítems en el menú`);
      return;
    }
    this.navItems.push(this.createNavItemGroup());
    const idx = this.navItems.length - 1;
    this.expandedCards.update((set) => new Set(set).add(`n-${idx}`));
    this.navItems.markAsDirty();
    this._dirtyTick.update((n) => n + 1);
  }

  removeNavItem(index: number): void {
    if (this.navItems.length <= MIN_NAV_ITEMS) {
      this.toast.error(`Mínimo ${MIN_NAV_ITEMS} ítems en el menú`);
      return;
    }
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
    if (this.navItems.length < MIN_NAV_ITEMS || this.navItems.length > MAX_NAV_ITEMS) {
      this.toast.error(
        `El menú debe tener entre ${MIN_NAV_ITEMS} y ${MAX_NAV_ITEMS} ítems`,
      );
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
          sectionBgColor: find.sectionBgColor,
          sectionTextColor: find.sectionTextColor,
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
    const columns = this.footerColumns.controls.map((ctrl) => {
      const rawType = ctrl.get('type')?.value;
      const type: FooterColumnType =
        rawType === 'links' || rawType === 'html' ? rawType : 'text';
      if (type === 'links') {
        const links = (ctrl.get('links') as FormArray<FormControl<string>>).controls
          .map((c) => {
            const page = HOME_PAGE_OPTIONS.find((p) => p.value === c.value);
            if (!page) return null;
            return { label: page.label, href: page.href };
          })
          .filter((l): l is { label: string; href: string } => !!l)
          .slice(0, MAX_FOOTER_COLUMN_LINKS);
        return { type, lines: [], links, html: '' };
      }
      if (type === 'html') {
        const html = String(ctrl.get('html')?.value ?? '').trim();
        return { type, lines: [], links: [], html };
      }
      const lines = (ctrl.get('lines') as FormArray<FormControl<string>>).controls
        .map((c) => c.value.trim())
        .filter(Boolean)
        .slice(0, MAX_FOOTER_COLUMN_LINES);
      return { type, lines, links: [], html: '' };
    });
    return {
      topImageUrl: f.topImageUrl || undefined,
      logoUrl: f.logoUrl || undefined,
      widgetsBgColor: f.widgetsBgColor || undefined,
      widgetsTextColor: f.widgetsTextColor || undefined,
      columns,
      legalLinks: [],
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
      sectionBgColor: data.findProduct.sectionBgColor ?? DEFAULT_FIND_BG,
      sectionTextColor: data.findProduct.sectionTextColor ?? DEFAULT_FIND_TEXT,
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
      widgetsBgColor: data.footer.widgetsBgColor ?? DEFAULT_FIND_BG,
      widgetsTextColor: data.footer.widgetsTextColor ?? DEFAULT_FIND_TEXT,
    });
    this.patchFooterColumns(data.footer);

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
    const navItems = (data.nav?.items ?? []).slice(0, MAX_NAV_ITEMS);
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
    this.footerColumns.markAsPristine();
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

  private createFooterColumnGroup(col: {
    type: FooterColumnType;
    lines: string[];
    pageSlugs: string[];
    html: string;
  }): FormGroup {
    const lines =
      col.lines.length > 0 ? col.lines : col.type === 'text' ? [''] : [];
    return this.fb.nonNullable.group({
      type: [col.type],
      html: [col.html ?? ''],
      lines: this.fb.array(
        lines
          .slice(0, MAX_FOOTER_COLUMN_LINES)
          .map((line) => this.fb.nonNullable.control(line)),
      ),
      links: this.fb.array(
        col.pageSlugs
          .slice(0, MAX_FOOTER_COLUMN_LINKS)
          .map((slug) => this.fb.nonNullable.control(slug)),
      ),
    });
  }

  private patchFooterColumns(footer: HomeContent['footer']): void {
    const cols = this.resolveAdminFooterColumns(footer);
    this.footerColumns.clear();
    for (const col of cols) {
      this.footerColumns.push(this.createFooterColumnGroup(col));
    }
  }

  private resolveAdminFooterColumns(
    footer: HomeContent['footer'],
  ): Array<{
    type: FooterColumnType;
    lines: string[];
    pageSlugs: string[];
    html: string;
  }> {
    const fromColumns = Array.isArray(footer.columns) ? footer.columns : [];
    const result: Array<{
      type: FooterColumnType;
      lines: string[];
      pageSlugs: string[];
      html: string;
    }> = [];

    for (let i = 0; i < FOOTER_COLUMN_COUNT; i++) {
      const col = fromColumns[i];
      if (!col) {
        if (
          i === 2 &&
          (footer.legalLinks?.length ?? 0) > 0 &&
          fromColumns.length < 3
        ) {
          result.push({
            type: 'links',
            lines: [],
            pageSlugs: this.hrefsToPageSlugs(footer.legalLinks ?? []),
            html: '',
          });
        } else if (i === 0 && (footer.address?.length ?? 0) > 0) {
          result.push({
            type: 'text',
            lines: footer.address ?? [],
            pageSlugs: [],
            html: '',
          });
        } else if (i === 1 && (footer.phones?.length ?? 0) > 0) {
          result.push({
            type: 'text',
            lines: ['Consultas y pedidos', ...(footer.phones ?? [])],
            pageSlugs: [],
            html: '',
          });
        } else {
          result.push({
            type: i === 2 ? 'links' : 'text',
            lines: i === 2 ? [] : [''],
            pageSlugs: [],
            html: '',
          });
        }
        continue;
      }

      if (col.type === 'html' || (!!col.html?.trim() && col.type !== 'text' && col.type !== 'links')) {
        result.push({
          type: 'html',
          lines: [],
          pageSlugs: [],
          html: col.html ?? '',
        });
        continue;
      }

      const isLinks =
        col.type === 'links' ||
        (!!col.links?.length && col.type !== 'text') ||
        (i === 2 &&
          !(col.lines ?? []).some((l) => !!l.trim()) &&
          (footer.legalLinks?.length ?? 0) > 0 &&
          !(col.links?.length));

      if (isLinks) {
        const links = col.links?.length
          ? col.links
          : (footer.legalLinks ?? []);
        result.push({
          type: 'links',
          lines: [],
          pageSlugs: this.hrefsToPageSlugs(links),
          html: '',
        });
      } else {
        result.push({
          type: 'text',
          lines: col.lines?.length ? col.lines : [''],
          pageSlugs: [],
          html: '',
        });
      }
    }

    return result;
  }

  private hrefsToPageSlugs(
    links: Array<{ label?: string; href?: string }>,
  ): string[] {
    const slugs: string[] = [];
    for (const link of links) {
      const href = link.href?.trim();
      if (!href) continue;
      const page = HOME_PAGE_OPTIONS.find(
        (p) => p.href === href || `/${p.value}` === href || p.value === href,
      );
      if (page && !slugs.includes(page.value)) {
        slugs.push(page.value);
      }
    }
    return slugs.slice(0, MAX_FOOTER_COLUMN_LINKS);
  }
}
