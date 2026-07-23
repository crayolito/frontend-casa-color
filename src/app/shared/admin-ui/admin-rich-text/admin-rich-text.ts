import {
  Component,
  ChangeDetectionStrategy,
  ElementRef,
  OnDestroy,
  afterNextRender,
  inject,
  input,
  output,
  viewChild,
  DestroyRef,
} from '@angular/core';
import { Editor } from '@tiptap/core';
import StarterKit from '@tiptap/starter-kit';

/** Bloques de sección (espejo del contrato backend). */
export type RichTextBlock =
  | { type: 'heading' | 'paragraph'; text: string }
  | { type: 'list'; items: string[] };

type TipTapNode = {
  type?: string;
  content?: TipTapNode[];
  text?: string;
  marks?: Array<{ type: string }>;
  attrs?: Record<string, unknown>;
};

@Component({
  selector: 'app-admin-rich-text',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="admin-rt">
      @if (label(); as lbl) {
        <span class="admin-rt__label">{{ lbl }}</span>
      }
      <div class="admin-rt__toolbar" role="toolbar" aria-label="Formato">
        <button
          type="button"
          class="admin-rt__btn"
          [class.admin-rt__btn--active]="isActive('bold')"
          (click)="run('toggleBold')"
          title="Negrita"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          class="admin-rt__btn"
          [class.admin-rt__btn--active]="isActive('italic')"
          (click)="run('toggleItalic')"
          title="Cursiva"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          class="admin-rt__btn"
          [class.admin-rt__btn--active]="isActive('heading', { level: 2 })"
          (click)="run('toggleHeading', { level: 2 })"
          title="Título"
        >
          H2
        </button>
        <button
          type="button"
          class="admin-rt__btn"
          [class.admin-rt__btn--active]="isActive('bulletList')"
          (click)="run('toggleBulletList')"
          title="Lista"
        >
          • Lista
        </button>
      </div>
      <div #host class="admin-rt__editor"></div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .admin-rt {
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }

    .admin-rt__label {
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--color-text);
    }

    .admin-rt__toolbar {
      display: flex;
      flex-wrap: wrap;
      gap: 0.25rem;
      padding: 0.375rem;
      border: 1px solid var(--admin-border);
      border-bottom: 0;
      border-radius: var(--radius-md) var(--radius-md) 0 0;
      background: #fafafa;
    }

    .admin-rt__btn {
      min-height: 28px;
      padding: 0.2rem 0.5rem;
      border: 1px solid transparent;
      border-radius: var(--radius-sm);
      background: transparent;
      font-size: 0.8125rem;
      color: #333;
      cursor: pointer;
    }

    .admin-rt__btn:hover {
      background: rgba(221, 51, 51, 0.06);
      border-color: var(--admin-border);
    }

    .admin-rt__btn--active {
      background: rgba(221, 51, 51, 0.1);
      border-color: rgba(221, 51, 51, 0.35);
      color: var(--color-accent);
    }

    .admin-rt__editor {
      min-height: 120px;
      padding: 0.625rem 0.75rem;
      border: 1px solid var(--admin-border);
      border-radius: 0 0 var(--radius-md) var(--radius-md);
      background: var(--color-white);
      font-size: 0.9375rem;
      color: #333;
      line-height: 1.5;
    }

    .admin-rt__editor:focus-within {
      border-color: var(--color-accent);
      box-shadow: 0 0 0 3px rgba(221, 51, 51, 0.12);
    }

    :host ::ng-deep .ProseMirror {
      outline: none;
      min-height: 96px;
    }

    :host ::ng-deep .ProseMirror p {
      margin: 0 0 0.5rem;
    }

    :host ::ng-deep .ProseMirror h2 {
      margin: 0 0 0.5rem;
      font-size: 1.1rem;
      font-weight: 600;
    }

    :host ::ng-deep .ProseMirror ul {
      margin: 0 0 0.5rem;
      padding-left: 1.25rem;
    }
  `,
})
export class AdminRichText implements OnDestroy {
  private readonly destroyRef = inject(DestroyRef);
  private readonly host = viewChild.required<ElementRef<HTMLDivElement>>('host');

  readonly label = input<string | null>(null);
  readonly content = input<RichTextBlock[]>([]);
  readonly contentChange = output<RichTextBlock[]>();

  private editor: Editor | null = null;
  private suppressEmit = false;

  constructor() {
    afterNextRender(() => {
      this.initEditor();
    });
    this.destroyRef.onDestroy(() => this.destroyEditor());
  }

  ngOnDestroy(): void {
    this.destroyEditor();
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
      default:
        break;
    }
  }

  private initEditor(): void {
    const el = this.host().nativeElement;
    this.editor = new Editor({
      element: el,
      extensions: [
        StarterKit.configure({
          heading: { levels: [2, 3] },
          codeBlock: false,
          blockquote: false,
          horizontalRule: false,
          code: false,
        }),
      ],
      content: this.blocksToDoc(this.content()),
      onUpdate: ({ editor }) => {
        if (this.suppressEmit) return;
        this.contentChange.emit(this.docToBlocks(editor.getJSON() as TipTapNode));
      },
    });
  }

  private destroyEditor(): void {
    this.editor?.destroy();
    this.editor = null;
  }

  /** SectionBlock[] → documento Tiptap */
  private blocksToDoc(blocks: RichTextBlock[]): TipTapNode {
    if (!blocks.length) {
      return { type: 'doc', content: [{ type: 'paragraph' }] };
    }
    const content: TipTapNode[] = [];
    for (const block of blocks) {
      if (block.type === 'heading') {
        content.push({
          type: 'heading',
          attrs: { level: 2 },
          content: this.parseInline(block.text),
        });
      } else if (block.type === 'paragraph') {
        content.push({
          type: 'paragraph',
          content: this.parseInline(block.text),
        });
      } else if (block.type === 'list') {
        content.push({
          type: 'bulletList',
          content: block.items.map((item) => ({
            type: 'listItem',
            content: [
              {
                type: 'paragraph',
                content: this.parseInline(item),
              },
            ],
          })),
        });
      }
    }
    return { type: 'doc', content };
  }

  /** Documento Tiptap → SectionBlock[] */
  private docToBlocks(doc: TipTapNode): RichTextBlock[] {
    const blocks: RichTextBlock[] = [];
    for (const node of doc.content ?? []) {
      if (node.type === 'heading') {
        blocks.push({ type: 'heading', text: this.serializeInline(node.content ?? []) });
      } else if (node.type === 'paragraph') {
        const text = this.serializeInline(node.content ?? []);
        if (text.trim()) blocks.push({ type: 'paragraph', text });
      } else if (node.type === 'bulletList') {
        const items: string[] = [];
        for (const li of node.content ?? []) {
          const para = li.content?.[0];
          items.push(this.serializeInline(para?.content ?? []));
        }
        if (items.length) blocks.push({ type: 'list', items });
      }
    }
    return blocks;
  }

  /** markdown-lite inline → nodos texto Tiptap */
  private parseInline(text: string): TipTapNode[] {
    const nodes: TipTapNode[] = [];
    const re = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
    let last = 0;
    let match: RegExpExecArray | null;
    while ((match = re.exec(text)) !== null) {
      if (match.index > last) {
        nodes.push({ type: 'text', text: text.slice(last, match.index) });
      }
      const token = match[0];
      if (token.startsWith('**')) {
        nodes.push({
          type: 'text',
          text: token.slice(2, -2),
          marks: [{ type: 'bold' }],
        });
      } else {
        nodes.push({
          type: 'text',
          text: token.slice(1, -1),
          marks: [{ type: 'italic' }],
        });
      }
      last = match.index + token.length;
    }
    if (last < text.length) {
      nodes.push({ type: 'text', text: text.slice(last) });
    }
    return nodes.length ? nodes : [{ type: 'text', text: '' }];
  }

  private serializeInline(nodes: TipTapNode[]): string {
    return nodes
      .map((n) => {
        const t = n.text ?? '';
        const marks = n.marks?.map((m) => m.type) ?? [];
        if (marks.includes('bold')) return `**${t}**`;
        if (marks.includes('italic')) return `*${t}*`;
        return t;
      })
      .join('');
  }
}
