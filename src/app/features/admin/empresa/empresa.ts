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
import { EmpresaApi } from '../data/empresa.api';
import { EmpresaContent, EmpresaSection } from '../data/admin.models';
import {
  ResolvedErrorMessage,
  resolveErrorMessage,
} from '../../../shared/errors/resolve-error-message';
import { AdminPageHeader } from '../../../shared/admin-ui/admin-page-header/admin-page-header';
import { AdminButton } from '../../../shared/admin-ui/admin-button/admin-button';
import { AdminFormField } from '../../../shared/admin-ui/admin-form-field/admin-form-field';
import { AdminIcon } from '../../../shared/admin-ui/icons/admin-icon';
import { AdminIconButton } from '../../../shared/admin-ui/admin-icon-button/admin-icon-button';
import { ImageUploader } from '../../../shared/admin-ui/image-uploader/image-uploader';
import { AdminErrorState } from '../../../shared/admin-ui/admin-error-state/admin-error-state';
import { AdminHtmlEditor } from '../../../shared/admin-ui/admin-html-editor/admin-html-editor';
import { AdminModal } from '../../../shared/admin-ui/admin-modal/admin-modal';
import { AdminFormContext } from '../../../shared/admin-ui/admin-form-context/admin-form-context';
import { AdminToastService } from '../../../shared/admin-ui/admin-toast/admin-toast.service';

const MIN_SECTIONS = 1;
const MAX_SECTIONS = 5;
const DEFAULT_TITLE_COLOR = '#dd3333';

type SectionGroup = FormGroup<{
  id: FormControl<string>;
  title: FormControl<string>;
  titleColor: FormControl<string>;
  descriptionHtml: FormControl<string>;
  sideImageUrl: FormControl<string>;
  sortOrder: FormControl<number>;
}>;

function newSectionId(): string {
  return `sec-${crypto.randomUUID().slice(0, 8)}`;
}

@Component({
  selector: 'app-admin-empresa',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    DragDropModule,
    AdminPageHeader,
    AdminButton,
    AdminFormField,
    AdminIcon,
    AdminIconButton,
    ImageUploader,
    AdminErrorState,
    AdminHtmlEditor,
    AdminModal,
  ],
  templateUrl: './empresa.html',
  styleUrl: './empresa.css',
})
export class AdminEmpresa implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly api = inject(EmpresaApi);
  private readonly destroyRef = inject(DestroyRef);
  private readonly toast = inject(AdminToastService);
  private readonly formCtx = inject(AdminFormContext);

  readonly minSections = MIN_SECTIONS;
  readonly maxSections = MAX_SECTIONS;

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<ResolvedErrorMessage | null>(null);
  readonly sectionModalOpen = signal(false);
  readonly sectionEditIndex = signal<number | null>(null);

  private readonly _dirtyTick = signal(0);
  readonly sectionsVersion = signal(0);

  readonly form = this.fb.nonNullable.group({
    heroImageUrl: [''],
    sections: this.fb.array<SectionGroup>([this.createSectionGroup()]),
  });

  readonly sectionCount = computed(() => {
    this.sectionsVersion();
    return this.sectionsFA.length;
  });
  readonly canAdd = computed(() => this.sectionCount() < MAX_SECTIONS);
  readonly canRemove = computed(() => this.sectionCount() > MIN_SECTIONS);
  readonly formDirty = computed(() => {
    this._dirtyTick();
    return this.form.dirty;
  });

  get sectionsFA(): FormArray<SectionGroup> {
    return this.form.controls.sections;
  }

  sectionGroup(index: number): SectionGroup {
    return this.sectionsFA.at(index);
  }

  cardTitle(index: number): string {
    const title = this.sectionsFA.at(index).value.title?.trim();
    return title || `Sección ${index + 1}`;
  }

  sectionModalTitle(): string {
    const idx = this.sectionEditIndex();
    if (idx === null) return 'Sección';
    return this.cardTitle(idx);
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

    this.form.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this._dirtyTick.update((n) => n + 1);
      });
    this.load();
  }

  onHeroUploaded(url: string | null): void {
    this.form.controls.heroImageUrl.setValue(url ?? '');
    this.form.controls.heroImageUrl.markAsDirty();
  }

  onSideImageUploaded(index: number, url: string | null): void {
    this.sectionsFA.at(index).patchValue({ sideImageUrl: url ?? '' });
    this.sectionsFA.at(index).markAsDirty();
    this.form.markAsDirty();
  }

  onDescriptionChange(index: number, html: string): void {
    this.sectionsFA.at(index).patchValue({ descriptionHtml: html });
    this.sectionsFA.at(index).markAsDirty();
    this.form.markAsDirty();
  }

  openAddSection(): void {
    if (!this.canAdd()) {
      this.toast.error(`Máximo ${MAX_SECTIONS} secciones`);
      return;
    }
    const idx = this.sectionsFA.length;
    this.sectionsFA.push(this.createSectionGroup(undefined, idx));
    this.sectionsVersion.update((n) => n + 1);
    this.form.markAsDirty();
    this._dirtyTick.update((n) => n + 1);
    this.sectionEditIndex.set(idx);
    this.sectionModalOpen.set(true);
  }

  openEditSection(index: number): void {
    this.sectionEditIndex.set(index);
    this.sectionModalOpen.set(true);
  }

  closeSectionModal(): void {
    this.sectionModalOpen.set(false);
    this.sectionEditIndex.set(null);
  }

  removeSection(index: number): void {
    if (!this.canRemove()) return;
    if (this.sectionEditIndex() === index) this.closeSectionModal();
    this.sectionsFA.removeAt(index);
    this.sectionsVersion.update((n) => n + 1);
    this.form.markAsDirty();
    this._dirtyTick.update((n) => n + 1);
  }

  dropSection(event: CdkDragDrop<SectionGroup[]>): void {
    moveItemInArray(
      this.sectionsFA.controls,
      event.previousIndex,
      event.currentIndex,
    );
    this.sectionsVersion.update((n) => n + 1);
    this.form.markAsDirty();
    this._dirtyTick.update((n) => n + 1);
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.closeSectionModal();

    this.api
      .getPublic()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (content) => {
          this.loading.set(false);
          this.applyContent(content);
        },
        error: (err: unknown) => {
          this.loading.set(false);
          this.error.set(resolveErrorMessage(err));
        },
      });
  }

  discardChanges(): void {
    this.closeSectionModal();
    this.load();
  }

  save(): void {
    this.form.markAllAsTouched();
    if (this.form.invalid) {
      this.toast.error('Completá título y al menos una sección.');
      return;
    }

    const raw = this.form.getRawValue();
    const sections: EmpresaSection[] = raw.sections.map((s, index) => ({
      id: s.id.trim() || newSectionId(),
      title: s.title.trim(),
      titleColor: s.titleColor.trim() || DEFAULT_TITLE_COLOR,
      descriptionHtml: s.descriptionHtml,
      sideImageUrl: s.sideImageUrl.trim() || undefined,
      sortOrder: index,
    }));

    if (sections.length < MIN_SECTIONS || sections.length > MAX_SECTIONS) {
      this.toast.error(
        `Debés configurar entre ${MIN_SECTIONS} y ${MAX_SECTIONS} secciones.`,
      );
      return;
    }

    const body: EmpresaContent = {
      hero: {
        imageUrl: raw.heroImageUrl.trim(),
      },
      sections,
    };

    this.saving.set(true);
    this.error.set(null);
    this.api
      .upsert(body)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (saved) => {
          this.saving.set(false);
          this.toast.success('Empresa guardada.');
          this.closeSectionModal();
          this.applyContent(saved);
        },
        error: (err: unknown) => {
          this.saving.set(false);
          this.error.set(resolveErrorMessage(err));
        },
      });
  }

  private createSectionGroup(
    section?: EmpresaSection,
    index = 0,
  ): SectionGroup {
    return this.fb.nonNullable.group({
      id: [section?.id ?? newSectionId()],
      title: [
        section?.title ?? '',
        [Validators.required, Validators.maxLength(200)],
      ],
      titleColor: [section?.titleColor ?? DEFAULT_TITLE_COLOR],
      descriptionHtml: [section?.descriptionHtml ?? ''],
      sideImageUrl: [section?.sideImageUrl ?? ''],
      sortOrder: [section?.sortOrder ?? index],
    });
  }

  private applyContent(content: EmpresaContent): void {
    this.form.controls.heroImageUrl.setValue(content.hero.imageUrl ?? '');

    while (this.sectionsFA.length > 0) {
      this.sectionsFA.removeAt(0);
    }

    const seed =
      content.sections.length >= MIN_SECTIONS
        ? content.sections.slice(0, MAX_SECTIONS)
        : [
            {
              id: newSectionId(),
              title: 'Nueva sección',
              titleColor: DEFAULT_TITLE_COLOR,
              descriptionHtml: '',
              sortOrder: 0,
            },
          ];

    for (const [index, section] of seed.entries()) {
      this.sectionsFA.push(this.createSectionGroup(section, index));
    }
    this.sectionsVersion.update((n) => n + 1);
    this.form.markAsPristine();
    this._dirtyTick.update((n) => n + 1);
  }
}
