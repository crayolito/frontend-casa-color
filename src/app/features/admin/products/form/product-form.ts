import {
  Component,
  ChangeDetectionStrategy,
  inject,
  input,
  signal,
  OnInit,
} from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProductsApi } from '../../data/products.api';
import { CatalogsApi } from '../../data/catalogs.api';
import { Catalog, Product, ProductWrite, SectionBlock } from '../../data/admin.models';
import { isAppError } from '../../../../shared/util/api-errors';
import { AdminPageHeader } from '../../../../shared/admin-ui/admin-page-header/admin-page-header';
import { AdminButton } from '../../../../shared/admin-ui/admin-button/admin-button';
import { AdminFormField } from '../../../../shared/admin-ui/admin-form-field/admin-form-field';
import { AdminIcon } from '../../../../shared/admin-ui/icons/admin-icon';
import {
  ImageGallery,
  GalleryImage,
} from '../../../../shared/admin-ui/image-gallery/image-gallery';
import { ImageUploader } from '../../../../shared/admin-ui/image-uploader/image-uploader';

@Component({
  selector: 'app-admin-product-form',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    RouterLink,
    AdminPageHeader,
    AdminButton,
    AdminFormField,
    AdminIcon,
    ImageGallery,
    ImageUploader,
  ],
  templateUrl: './product-form.html',
  styleUrl: './product-form.css',
})
export class AdminProductForm implements OnInit {
  /** Bound from route `:id` when editing. */
  readonly id = input<string | undefined>(undefined);

  private readonly fb = inject(FormBuilder);
  private readonly productsApi = inject(ProductsApi);
  private readonly catalogsApi = inject(CatalogsApi);
  private readonly router = inject(Router);

  readonly catalogs = signal<Catalog[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly loadedProduct = signal<Product | null>(null);

  readonly images = signal<GalleryImage[]>([]);

  readonly form = this.fb.nonNullable.group({
    catalogId: [0, [Validators.required, Validators.min(1)]],
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
    this.catalogsApi.list(1, 100).subscribe({
      next: (res) => this.catalogs.set(res.data),
    });

    const idParam = this.id();
    if (idParam) {
      this.loadProduct(Number(idParam));
    } else {
      const first = this.catalogs()[0]?.id ?? 0;
      this.form.patchValue({ catalogId: first });
    }
  }

  private loadProduct(productId: number): void {
    this.loading.set(true);
    this.productsApi.getById(productId).subscribe({
      next: (product) => {
        this.loading.set(false);
        this.loadedProduct.set(product);
        this.patchForm(product);
      },
      error: (err: unknown) => {
        this.loading.set(false);
        this.error.set(isAppError(err) ? err.message : 'Error al cargar');
      },
    });
  }

  private patchForm(product: Product): void {
    this.form.patchValue({
      catalogId: product.catalogId,
      title: product.title,
      slug: product.slug,
      description: product.description ?? '',
      technicalSheetUrl: product.technicalSheetUrl ?? '',
      isActive: product.isActive,
      displayOrder: product.displayOrder,
    });

    this.images.set(
      product.images.map((img) => ({
        url: img.url,
        publicId: img.publicId,
        isMain: img.isMain,
        displayOrder: img.displayOrder,
      })),
    );

    this.presentations.clear();
    for (const p of product.presentations) {
      this.presentations.push(this.createPresentationGroup(p.value, p.displayOrder));
    }

    this.finishes.clear();
    for (const f of product.finishes) {
      this.finishes.push(
        this.createFinishGroup(f.name, f.imageUrl ?? '', f.displayOrder),
      );
    }

    this.colors.clear();
    for (const c of product.colors) {
      this.colors.push(
        this.createColorGroup(c.name, c.hexCode ?? '', c.imageUrl ?? '', c.displayOrder),
      );
    }

    this.sections.clear();
    for (const s of product.sections) {
      this.sections.push(
        this.createSectionGroup(
          s.title,
          s.icon ?? '',
          this.serializeContent(s.content),
          s.displayOrder,
        ),
      );
    }
  }

  createPresentationGroup(value = '', displayOrder = 0): FormGroup {
    return this.fb.nonNullable.group({
      value: [value, [Validators.required, Validators.maxLength(100)]],
      displayOrder: [displayOrder, [Validators.min(0)]],
    });
  }

  createFinishGroup(name = '', imageUrl = '', displayOrder = 0): FormGroup {
    return this.fb.nonNullable.group({
      name: [name, [Validators.required, Validators.maxLength(100)]],
      imageUrl: [imageUrl],
      displayOrder: [displayOrder, [Validators.min(0)]],
    });
  }

  createColorGroup(
    name = '',
    hexCode = '',
    imageUrl = '',
    displayOrder = 0,
  ): FormGroup {
    return this.fb.nonNullable.group({
      name: [name, [Validators.required, Validators.maxLength(100)]],
      hexCode: [hexCode, [Validators.pattern(/^$|^#[0-9A-Fa-f]{6}$/)]],
      imageUrl: [imageUrl],
      displayOrder: [displayOrder, [Validators.min(0)]],
    });
  }

  createSectionGroup(
    title = '',
    icon = '',
    contentJson = '[]',
    displayOrder = 0,
  ): FormGroup {
    return this.fb.nonNullable.group({
      title: [title, [Validators.required, Validators.maxLength(150)]],
      icon: [icon],
      contentJson: [contentJson, [Validators.required]],
      displayOrder: [displayOrder, [Validators.min(0)]],
    });
  }

  addPresentation(): void {
    this.presentations.push(this.createPresentationGroup());
  }

  removePresentation(index: number): void {
    this.presentations.removeAt(index);
  }

  addFinish(): void {
    this.finishes.push(this.createFinishGroup());
  }

  removeFinish(index: number): void {
    this.finishes.removeAt(index);
  }

  onFinishImageChange(index: number, url: string | null): void {
    this.finishes.at(index).controls['imageUrl'].setValue(url ?? '');
  }

  addColor(): void {
    this.colors.push(this.createColorGroup());
  }

  removeColor(index: number): void {
    this.colors.removeAt(index);
  }

  onColorImageChange(index: number, url: string | null): void {
    this.colors.at(index).controls['imageUrl'].setValue(url ?? '');
  }

  addSection(): void {
    this.sections.push(
      this.createSectionGroup('', '', '[{"type":"paragraph","text":""}]'),
    );
  }

  removeSection(index: number): void {
    this.sections.removeAt(index);
  }

  onImagesChange(next: GalleryImage[]): void {
    this.images.set(next);
  }

  private serializeContent(content: SectionBlock[]): string {
    return JSON.stringify(content, null, 2);
  }

  private parseContent(raw: string): SectionBlock[] | null {
    try {
      const parsed: unknown = JSON.parse(raw);
      if (!Array.isArray(parsed)) {
        return null;
      }
      return parsed as SectionBlock[];
    } catch {
      return null;
    }
  }

  save(): void {
    this.error.set(null);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.error.set('Revisá los campos requeridos');
      return;
    }

    const raw = this.form.getRawValue();
    const sections: ProductWrite['sections'] = [];

    for (const s of raw.sections) {
      const content = this.parseContent(String(s['contentJson'] ?? ''));
      if (!content) {
        this.error.set('Una sección tiene JSON de content inválido');
        return;
      }
      sections.push({
        title: String(s['title']).trim(),
        icon: String(s['icon'] ?? '').trim() || undefined,
        content,
        displayOrder: Number(s['displayOrder']) || 0,
      });
    }

    const body: ProductWrite = {
      catalogId: Number(raw.catalogId),
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
      presentations: raw.presentations.map((p) => ({
        value: String(p['value']).trim(),
        displayOrder: Number(p['displayOrder']) || 0,
      })),
      finishes: raw.finishes.map((f) => ({
        name: String(f['name']).trim(),
        imageUrl: String(f['imageUrl'] ?? '').trim() || undefined,
        displayOrder: Number(f['displayOrder']) || 0,
      })),
      colors: raw.colors.map((c) => ({
        name: String(c['name']).trim(),
        hexCode: String(c['hexCode'] ?? '').trim() || undefined,
        imageUrl: String(c['imageUrl'] ?? '').trim() || undefined,
        displayOrder: Number(c['displayOrder']) || 0,
      })),
      sections,
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
        this.error.set(isAppError(err) ? err.message : 'Error al guardar');
      },
    });
  }
}
