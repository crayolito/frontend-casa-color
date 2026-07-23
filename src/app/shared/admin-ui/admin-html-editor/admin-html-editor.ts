import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  OnDestroy,
  afterNextRender,
  effect,
  inject,
  input,
  output,
  signal,
  viewChild,
  DestroyRef,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import { Table } from '@tiptap/extension-table';
import { TableRow } from '@tiptap/extension-table-row';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';

type EditorMode = 'visual' | 'html';

function normalizeHtml(value: string): string {
  const v = (value ?? '').trim();
  if (!v || v === '<p></p>' || v === '<p><br></p>') return '';
  return v;
}

@Component({
  selector: 'app-admin-html-editor',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule],
  template: `
    <div class="admin-he">
      <div class="admin-he__head">
        @if (label(); as lbl) {
          <span class="admin-he__label">{{ lbl }}</span>
        } @else {
          <span></span>
        }
        <div class="admin-he__modes" role="group" aria-label="Modo de edición">
          <button
            type="button"
            class="admin-he__mode"
            [class.admin-he__mode--active]="mode() === 'visual'"
            (click)="setMode('visual')"
          >
            Visual
          </button>
          <button
            type="button"
            class="admin-he__mode"
            [class.admin-he__mode--active]="mode() === 'html'"
            (click)="setMode('html')"
          >
            HTML
          </button>
        </div>
      </div>

      @if (mode() === 'visual') {
        <div class="admin-he__toolbar" role="toolbar" aria-label="Formato">
          <button type="button" class="admin-he__btn" [class.admin-he__btn--active]="isActive('bold')" (click)="run('toggleBold')" title="Negrita"><strong>B</strong></button>
          <button type="button" class="admin-he__btn" [class.admin-he__btn--active]="isActive('italic')" (click)="run('toggleItalic')" title="Cursiva"><em>I</em></button>
          <button type="button" class="admin-he__btn" [class.admin-he__btn--active]="isActive('heading', { level: 2 })" (click)="run('toggleHeading', { level: 2 })" title="Título">H2</button>
          <button type="button" class="admin-he__btn" [class.admin-he__btn--active]="isActive('bulletList')" (click)="run('toggleBulletList')" title="Lista">• Lista</button>
          <button type="button" class="admin-he__btn" [class.admin-he__btn--active]="isActive('orderedList')" (click)="run('toggleOrderedList')" title="Lista numerada">1. Lista</button>
          <button type="button" class="admin-he__btn" (click)="insertLink()" title="Link">Link</button>
          <button type="button" class="admin-he__btn" (click)="insertImage()" title="Imagen">Img</button>
          <button type="button" class="admin-he__btn" (click)="insertTable()" title="Tabla">Tabla</button>
        </div>
        <div #host class="admin-he__editor"></div>
      } @else {
        <textarea
          class="admin-he__html"
          rows="12"
          [ngModel]="htmlDraft()"
          (ngModelChange)="onHtmlDraftChange($event)"
          spellcheck="false"
          aria-label="Código HTML"
        ></textarea>
        <p class="admin-he__hint">
          Modo HTML: iframes, grids y clases CSS. El cliente sanitiza al renderizar.
        </p>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .admin-he {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }

    .admin-he__head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .admin-he__label {
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--color-text);
    }

    .admin-he__modes {
      display: inline-flex;
      border: 1px solid var(--admin-border);
      border-radius: var(--radius-sm);
      overflow: hidden;
    }

    .admin-he__mode {
      min-height: 28px;
      padding: 0.2rem 0.65rem;
      border: 0;
      background: #fafafa;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.03em;
      text-transform: uppercase;
      color: var(--color-text-muted);
      cursor: pointer;
    }

    .admin-he__mode--active {
      background: rgba(221, 51, 51, 0.1);
      color: var(--color-accent);
    }

    .admin-he__toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem;
      padding: 0.375rem;
      border: 1px solid var(--admin-border);
      border-bottom: 0;
      border-radius: var(--radius-md) var(--radius-md) 0 0;
      background: #fafafa;
    }

    .admin-he__btn {
      min-height: 28px;
      padding: 0.2rem 0.5rem;
      border: 1px solid transparent;
      border-radius: var(--radius-sm);
      background: transparent;
      font-size: 0.8125rem;
      color: #333;
      cursor: pointer;
    }

    .admin-he__btn:hover {
      background: rgba(221, 51, 51, 0.06);
      border-color: var(--admin-border);
    }

    .admin-he__btn--active {
      background: rgba(221, 51, 51, 0.1);
      border-color: rgba(221, 51, 51, 0.35);
      color: var(--color-accent);
    }

    .admin-he__editor {
      min-height: 160px;
      padding: 0.625rem 0.75rem;
      border: 1px solid var(--admin-border);
      border-radius: 0 0 var(--radius-md) var(--radius-md);
      background: var(--color-white);
      font-size: 0.9375rem;
      color: #333;
      line-height: 1.5;
    }

    .admin-he__editor:focus-within {
      border-color: var(--color-accent);
      box-shadow: 0 0 0 3px rgba(221, 51, 51, 0.12);
    }

    .admin-he__html {
      min-height: 200px;
      padding: 0.625rem 0.75rem;
      border: 1px solid var(--admin-border);
      border-radius: var(--radius-md);
      background: var(--color-white);
      color: #222;
      font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 0.8125rem;
      line-height: 1.45;
      resize: vertical;
    }

    .admin-he__html:focus {
      outline: none;
      border-color: var(--color-accent);
      box-shadow: 0 0 0 3px rgba(221, 51, 51, 0.12);
    }

    .admin-he__hint {
      margin: 0;
      font-size: 0.75rem;
      color: var(--color-text-muted);
    }

    :host ::ng-deep .ProseMirror {
      outline: none;
      min-height: 130px;
    }

    :host ::ng-deep .ProseMirror p {
      margin: 0 0 0.5rem;
    }

    :host ::ng-deep .ProseMirror h2 {
      margin: 0 0 0.5rem;
      font-size: 1.1rem;
      font-weight: 600;
    }

    :host ::ng-deep .ProseMirror ul,
    :host ::ng-deep .ProseMirror ol {
      margin: 0 0 0.5rem;
      padding-left: 1.25rem;
    }

    :host ::ng-deep .ProseMirror table {
      border-collapse: collapse;
      width: 100%;
      margin: 0 0 0.75rem;
    }

    :host ::ng-deep .ProseMirror td,
    :host ::ng-deep .ProseMirror th {
      border: 1px solid var(--admin-border);
      padding: 0.35rem 0.5rem;
      min-width: 60px;
    }

    :host ::ng-deep .ProseMirror img {
      max-width: 100%;
      height: auto;
    }
  `,
})
export class AdminHtmlEditor implements OnDestroy {
  private readonly destroyRef = inject(DestroyRef);
  private readonly host = viewChild<ElementRef<HTMLDivElement>>('host');

  readonly label = input<string | null>(null);
  readonly html = input('');
  readonly htmlChange = output<string>();

  readonly mode = signal<EditorMode>('visual');
  readonly htmlDraft = signal('');

  private editor: Editor | null = null;
  private suppressEmit = false;
  private lastEmitted = '';

  constructor() {
    afterNextRender(() => {
      this.htmlDraft.set(normalizeHtml(this.html() ?? ''));
      this.lastEmitted = this.htmlDraft();
      if (this.mode() === 'visual') {
        this.initEditor();
      }
    });

    effect(() => {
      const value = normalizeHtml(this.html() ?? '');
      if (value === this.lastEmitted) return;
      // No pisar mientras el usuario escribe.
      if (this.editor?.isFocused) return;
      this.lastEmitted = value;
      this.htmlDraft.set(value);
      if (this.editor && this.mode() === 'visual') {
        this.suppressEmit = true;
        this.editor.commands.setContent(value || '<p></p>', { emitUpdate: false });
        this.suppressEmit = false;
      }
    });

    this.destroyRef.onDestroy(() => this.destroyEditor());
  }

  ngOnDestroy(): void {
    this.destroyEditor();
  }

  setMode(next: EditorMode): void {
    if (next === this.mode()) return;

    if (next === 'html') {
      const current = normalizeHtml(this.editor?.getHTML() ?? this.htmlDraft());
      this.htmlDraft.set(current);
      this.emit(current);
      this.destroyEditor();
      this.mode.set('html');
      return;
    }

    this.mode.set('visual');
    queueMicrotask(() => this.initEditor());
  }

  onHtmlDraftChange(value: string): void {
    this.htmlDraft.set(value);
    this.emit(normalizeHtml(value));
  }

  isActive(name: string, attrs?: Record<string, unknown>): boolean {
    return this.editor?.isActive(name, attrs) ?? false;
  }

  run(command: string, attrs?: Record<string, unknown>): void {
    if (!this.editor) return;
    const chain = this.editor.chain().focus();
    switch (command) {
      case 'toggleBold':
        chain.toggleBold().run();
        break;
      case 'toggleItalic':
        chain.toggleItalic().run();
        break;
      case 'toggleHeading':
        chain.toggleHeading(attrs as { level: 2 }).run();
        break;
      case 'toggleBulletList':
        chain.toggleBulletList().run();
        break;
      case 'toggleOrderedList':
        chain.toggleOrderedList().run();
        break;
      default:
        break;
    }
  }

  insertLink(): void {
    if (!this.editor) return;
    const prev = this.editor.getAttributes('link')['href'] as string | undefined;
    const url = window.prompt('URL del enlace', prev ?? 'https://');
    if (url === null) return;
    if (url.trim() === '') {
      this.editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }
    this.editor
      .chain()
      .focus()
      .extendMarkRange('link')
      .setLink({ href: url.trim() })
      .run();
  }

  insertImage(): void {
    if (!this.editor) return;
    const url = window.prompt('URL de la imagen');
    if (!url?.trim()) return;
    this.editor.chain().focus().setImage({ src: url.trim() }).run();
  }

  insertTable(): void {
    if (!this.editor) return;
    this.editor
      .chain()
      .focus()
      .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
      .run();
  }

  private initEditor(): void {
    const el = this.host()?.nativeElement;
    if (!el || this.editor) return;

    const initial = this.htmlDraft() || normalizeHtml(this.html() ?? '');
    this.editor = new Editor({
      element: el,
      editable: true,
      extensions: [
        StarterKit.configure({
          heading: { levels: [2, 3] },
          codeBlock: false,
          code: false,
        }),
        Link.configure({
          openOnClick: false,
          HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
        }),
        Image.configure({ allowBase64: false }),
        Table.configure({ resizable: false }),
        TableRow,
        TableHeader,
        TableCell,
      ],
      content: initial || '<p></p>',
      onUpdate: ({ editor }) => {
        if (this.suppressEmit) return;
        const normalized = normalizeHtml(editor.getHTML());
        this.htmlDraft.set(normalized);
        this.emit(normalized);
      },
    });
  }

  private destroyEditor(): void {
    this.editor?.destroy();
    this.editor = null;
  }

  private emit(value: string): void {
    this.lastEmitted = value;
    this.htmlChange.emit(value);
  }
}
