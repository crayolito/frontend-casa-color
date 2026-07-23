import {
  Component,
  ChangeDetectionStrategy,
  inject,
  input,
  signal,
  OnInit,
  computed,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router } from '@angular/router';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';
import { ProductsApi } from '../../data/products.api';
import { CatalogsApi } from '../../data/catalogs.api';
import {
  Catalog,
  Product,
  ProductWrite,
  PRODUCT_SECTION_ICONS,
} from '../../data/admin.models';
import {
  ResolvedErrorMessage,
  localErrorMessage,
  resolveErrorMessage,
} from '../../../../shared/errors/resolve-error-message';
import { AdminPageHeader } from '../../../../shared/admin-ui/admin-page-header/admin-page-header';
import { AdminButton } from '../../../../shared/admin-ui/admin-button/admin-button';
import { AdminFormField } from '../../../../shared/admin-ui/admin-form-field/admin-form-field';
import { AdminIcon } from '../../../../shared/admin-ui/icons/admin-icon';
import { AdminSwitch } from '../../../../shared/admin-ui/admin-switch/admin-switch';
import { AdminHtmlEditor } from '../../../../shared/admin-ui/admin-html-editor/admin-html-editor';
import {
  ImageGallery,
  GalleryImage,
} from '../../../../shared/admin-ui/image-gallery/image-gallery';
import { AdminConfirmDialog } from '../../../../shared/admin-ui/admin-confirm-dialog/admin-confirm-dialog';
import { AdminErrorState } from '../../../../shared/admin-ui/admin-error-state/admin-error-state';

@Component({
  selector: 'app-admin-product-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    DragDropModule,
    AdminPageHeader,
    AdminButton,
    AdminFormField,
    AdminIcon,
    AdminSwitch,
    AdminHtmlEditor,
    ImageGallery,
    AdminConfirmDialog,
    AdminErrorState,
  ],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css',
})
export class AdminProductForm implements OnInit {
  readonly id = input<string | undefined>(undefined);

  private readonly fb = inject(FormBuilder);
  private readonly productsApi = inject(ProductsApi);
  private readonly catalogsApi = inject(CatalogsApi);
  private readonly router = inject(Router);

  readonly catalogs = signal<Catalog[]>([]);
  readonly selectedCatalogIds = signal<number[]>([]);
  readonly catalogSearch = signal('');
  readonly catalogPickerOpen = signal(false);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<ResolvedErrorMessage | null>(null);
  readonly loadedProduct = signal<Product | null>(null);
  readonly discardOpen = signal(false);
  readonly images = signal<GalleryImage[]>([]);
  readonly sectionIcons = PRODUCT_SECTION_ICONS;

  private readonly _dirtyTick = signal(0);
  private _imagesDirty = false;
  private _imagesBaseline = '';
  private _catalogsBaseline = '';

  readonly form = this.fb.nonNullable.group({
    title: ['', [Validators.required, Validators.maxLength(200)]],
    slug: [''],
    description: [''],
    technicalSheetUrl: [''],
    isActive: [true],
    displayOrder: [0, [Validators.min(0)]],
    presentations: this.fb.array<FormGroup>([]),
    finishes: this.fb.array<FormGroup>([]),
    colors: this.fb.array<FormGroup>([]),
    sections: this.fb.array<FormGroup>([]),
  });

  readonly formDirty = computed(() => {
    this._dirtyTick();
    return (
      this.form.dirty ||
      this._imagesDirty ||
      JSON.stringify(this.selectedCatalogIds()) !== this._catalogsBaseline
    );
  });

  readonly filteredCatalogs = computed(() => {
    const q = this.catalogSearch().trim().toLowerCase();
    const selected = new Set(this.selectedCatalogIds());
    return this.catalogs().filter(
      (c) =>
        !selected.has(c.id) &&
        (!q || c.name.toLowerCase().includes(q)),
    );
  });

  readonly selectedCatalogs = computed(() => {
    const ids = this.selectedCatalogIds();
    return ids
      .map((id) => this.catalogs().find((c) => c.id === id))
      .filter((c): c is Catalog => !!c);
  });

  get presentations(): FormArray<FormGroup> {
    return this.form.controls.presentations;
  }
  get finishes(): FormArray<FormGroup> {
    return this.form.controls.finishes;
  }
  get colors(): FormArray<FormGroup> {
    return this.form.controls.colors;
  }
  get sections(): FormArray<FormGroup> {
    return this.form.controls.sections;
  }

  get isEdit(): boolean {
    return !!this.id();
  }

  ngOnInit(): void {
    this.form.valueChanges.subscribe(() => {
      this._dirtyTick.update((n) => n + 1);
    });

    this.catalogsApi.list(1, 100).subscribe({
      next: (res) => {
        this.catalogs.set(res.data);
        if (!this.isEdit && this.selectedCatalogIds().length === 0 && res.data[0]) {
          this.selectedCatalogIds.set([res.data[0].id]);
          this._catalogsBaseline = JSON.stringify([res.data[0].id]);
        }
      },
    });

    const idParam = this.id();
    if (idParam) {
      this.loadProduct(Number(idParam));
    } else {
      this._catalogsBaseline = JSON.stringify([]);
    }
  }

  private loadProduct(productId: number): void {
    this.loading.set(true);
    this.error.set(null);
    this.productsApi.getById(productId).subscribe({
      next: (product) => {
        this.loading.set(false);
        this.loadedProduct.set(product);
        this.patchForm(product);
      },
      error: (err: unknown) => {
        this.loading.set(false);
        this.error.set(resolveErrorMessage(err));
      },
    });
  }

  onRetryLoad(): void {
    const idParam = this.id();
    if (idParam) {
      this.loadProduct(Number(idParam));
    }
  }

  private patchForm(product: Product): void {
    this.form.patchValue({
      title: product.title,
      slug: product.slug,
      description: product.description ?? '',
      technicalSheetUrl: product.technicalSheetUrl ?? '',
      isActive: product.isActive,
      displayOrder: product.displayOrder,
    });

    const catalogIds =
      product.catalogs?.map((c) => c.id) ??
      (product.catalogId ? [product.catalogId] : []);
    this.selectedCatalogIds.set(catalogIds);
    this._catalogsBaseline = JSON.stringify(catalogIds);

    const gallery = product.images.map((img) => ({
      url: img.url,
      publicId: img.publicId,
      isMain: img.isMain,
      displayOrder: img.displayOrder,
    }));
    this.images.set(gallery);
    this._imagesBaseline = JSON.stringify(gallery);
    this._imagesDirty = false;

    this.presentations.clear();
    for (const p of product.presentations) {
      this.presentations.push(this.createPresentationGroup(p.value));
    }
    this.finishes.clear();
    for (const f of product.finishes) {
      this.finishes.push(this.createFinishGroup(f.name));
    }
    this.colors.clear();
    for (const c of product.colors) {
      this.colors.push(this.createColorGroup(c.name, c.hexCode ?? '#000000'));
    }
    this.sections.clear();
    for (const s of product.sections) {
      this.sections.push(
        this.createSectionGroup(
          s.title,
          s.icon ?? '',
          s.titleColor ?? '',
          typeof s.content === 'string' ? s.content : '',
        ),
      );
    }

    this.form.markAsPristine();
    this._dirtyTick.update((n) => n + 1);
  }

  createPresentationGroup(value = ''): FormGroup {
    return this.fb.nonNullable.group({
      value: [value, [Validators.required, Validators.maxLength(100)]],
    });
  }

  createFinishGroup(name = ''): FormGroup {
    return this.fb.nonNullable.group({
      name: [name, [Validators.required, Validators.maxLength(100)]],
    });
  }

  createColorGroup(name = '', hexCode = '#000000'): FormGroup {
    return this.fb.nonNullable.group({
      name: [name, [Validators.required, Validators.maxLength(100)]],
      hexCode: [hexCode, [Validators.pattern(/^$|^#[0-9A-Fa-f]{6}$/)]],
    });
  }

  createSectionGroup(
    title = '',
    icon = '',
    titleColor = '#333333',
    content = '',
  ): FormGroup {
    return this.fb.nonNullable.group({
      title: [title, [Validators.required, Validators.maxLength(150)]],
      icon: [icon],
      titleColor: [titleColor],
      content: [content],
    });
  }

  addPresentation(): void {
    this.presentations.push(this.createPresentationGroup());
    this.form.markAsDirty();
  }
  removePresentation(index: number): void {
    this.presentations.removeAt(index);
    this.form.markAsDirty();
  }
  dropPresentation(event: CdkDragDrop<FormGroup[]>): void {
    moveItemInArray(this.presentations.controls, event.previousIndex, event.currentIndex);
    this.form.markAsDirty();
    this._dirtyTick.update((n) => n + 1);
  }

  addFinish(): void {
    this.finishes.push(this.createFinishGroup());
    this.form.markAsDirty();
  }
  removeFinish(index: number): void {
    this.finishes.removeAt(index);
    this.form.markAsDirty();
  }
  dropFinish(event: CdkDragDrop<FormGroup[]>): void {
    moveItemInArray(this.finishes.controls, event.previousIndex, event.currentIndex);
    this.form.markAsDirty();
    this._dirtyTick.update((n) => n + 1);
  }

  addColor(): void {
    this.colors.push(this.createColorGroup());
    this.form.markAsDirty();
  }
  removeColor(index: number): void {
    this.colors.removeAt(index);
    this.form.markAsDirty();
  }
  dropColor(event: CdkDragDrop<FormGroup[]>): void {
    moveItemInArray(this.colors.controls, event.previousIndex, event.currentIndex);
    this.form.markAsDirty();
    this._dirtyTick.update((n) => n + 1);
  }
  onColorHexInput(index: number, value: string): void {
    this.colors.at(index).controls['hexCode'].setValue(value);
    this.colors.at(index).markAsDirty();
  }

  addSection(): void {
    this.sections.push(
      this.createSectionGroup('', this.sectionIcons[0].path, '#333333', ''),
    );
    this.form.markAsDirty();
  }
  removeSection(index: number): void {
    this.sections.removeAt(index);
    this.form.markAsDirty();
  }
  dropSection(event: CdkDragDrop<FormGroup[]>): void {
    moveItemInArray(this.sections.controls, event.previousIndex, event.currentIndex);
    this.form.markAsDirty();
    this._dirtyTick.update((n) => n + 1);
  }
  sectionContent(index: number): string {
    return String(this.sections.at(index).controls['content'].value ?? '');
  }
  onSectionContentChange(index: number, html: string): void {
    this.sections.at(index).controls['content'].setValue(html);
    this.sections.at(index).controls['content'].markAsDirty();
  }
  setSectionIcon(index: number, path: string): void {
    this.sections.at(index).controls['icon'].setValue(path);
    this.sections.at(index).markAsDirty();
  }

  onDescriptionChange(html: string): void {
    this.form.controls.description.setValue(html);
    this.form.controls.description.markAsDirty();
  }

  onImagesChange(next: GalleryImage[]): void {
    this.images.set(next);
    this._imagesDirty = JSON.stringify(next) !== this._imagesBaseline;
    this._dirtyTick.update((n) => n + 1);
  }

  addCatalog(id: number): void {
    if (this.selectedCatalogIds().includes(id)) return;
    this.selectedCatalogIds.update((ids) => [...ids, id]);
    this.catalogSearch.set('');
    this.catalogPickerOpen.set(false);
    this._dirtyTick.update((n) => n + 1);
  }

  removeCatalog(id: number): void {
    this.selectedCatalogIds.update((ids) => ids.filter((x) => x !== id));
    this._dirtyTick.update((n) => n + 1);
  }

  askDiscard(): void {
    if (!this.formDirty()) {
      void this.router.navigateByUrl('/admin/products');
      return;
    }
    this.discardOpen.set(true);
  }

  confirmDiscard(): void {
    this.discardOpen.set(false);
    const loaded = this.loadedProduct();
    if (loaded) {
      this.patchForm(loaded);
      return;
    }
    void this.router.navigateByUrl('/admin/products');
  }

  goBack(): void {
    void this.router.navigateByUrl('/admin/products');
  }

  save(): void {
    this.error.set(null);
    if (this.selectedCatalogIds().length === 0) {
      this.error.set(localErrorMessage('Agregá al menos un catálogo'));
      return;
    }
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set(localErrorMessage('Revisá los campos requeridos'));
      return;
    }

    const raw = this.form.getRawValue();
    const body: ProductWrite = {
      catalogIds: this.selectedCatalogIds(),
      catalogId: this.selectedCatalogIds()[0],
      title: raw.title.trim(),
      slug: raw.slug.trim() || undefined,
      description: raw.description.trim() || undefined,
      technicalSheetUrl: raw.technicalSheetUrl.trim() || undefined,
      isActive: raw.isActive,
      displayOrder: Number(raw.displayOrder) || 0,
      images: this.images().map((img, i) => ({
        url: img.url,
        publicId: img.publicId,
        isMain: i === 0 ? true : img.isMain,
        displayOrder: i,
      })),
      presentations: raw.presentations.map((p, i) => ({
        value: String(p['value']).trim(),
        displayOrder: i,
      })),
      finishes: raw.finishes.map((f, i) => ({
        name: String(f['name']).trim(),
        displayOrder: i,
      })),
      colors: raw.colors.map((c, i) => ({
        name: String(c['name']).trim(),
        hexCode: String(c['hexCode'] ?? '').trim() || undefined,
        displayOrder: i,
      })),
      sections: raw.sections.map((s, i) => ({
        title: String(s['title']).trim(),
        icon: String(s['icon'] ?? '').trim() || undefined,
        titleColor: String(s['titleColor'] ?? '').trim() || undefined,
        content: String(s['content'] ?? ''),
        displayOrder: i,
      })),
    };

    this.saving.set(true);
    const editId = this.id();
    const req = editId
      ? this.productsApi.update(Number(editId), body)
      : this.productsApi.create(body);

    req.subscribe({
      next: () => {
        this.saving.set(false);
        void this.router.navigateByUrl('/admin/products');
      },
      error: (err: unknown) => {
        this.saving.set(false);
        this.error.set(resolveErrorMessage(err));
      },
    });
  }
}
