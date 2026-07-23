import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminTable, AdminTableColumn } from './admin-table';

interface Row {
  id: number;
  title: string;
  imageUrl: string | null;
}

describe('AdminTable selection', () => {
  let fixture: ComponentFixture<AdminTable<Row>>;
  const columns: AdminTableColumn<Row>[] = [
    {
      key: 'image',
      label: 'Imagen',
      cell: () => '',
      image: (r) => r.imageUrl,
    },
    { key: 'title', label: 'Título', cell: (r) => r.title },
  ];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminTable],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminTable<Row>);
    fixture.componentRef.setInput('columns', columns);
    fixture.componentRef.setInput('rows', [
      { id: 1, title: 'A', imageUrl: 'https://x/a.jpg' },
      { id: 2, title: 'B', imageUrl: null },
    ]);
    fixture.componentRef.setInput('selectable', true);
    fixture.componentRef.setInput('selectedIds', new Set<number>());
    fixture.componentRef.setInput('trackBy', (r: Row) => r.id);
    fixture.detectChanges();
  });

  it('emits selectionChange when toggling a row checkbox', () => {
    const emitted: Array<Set<string | number>> = [];
    fixture.componentInstance.selectionChange.subscribe((s) => emitted.push(s));

    const checkbox = fixture.nativeElement.querySelector(
      'tbody .admin-table__checkbox',
    ) as HTMLInputElement;
    expect(checkbox).toBeTruthy();
    checkbox.checked = true;
    checkbox.dispatchEvent(new Event('change'));
    fixture.detectChanges();

    expect(emitted.length).toBe(1);
    expect(emitted[0].has(1)).toBe(true);
  });

  it('renders image thumbnails when column.image is set', () => {
    const img = fixture.nativeElement.querySelector(
      '.admin-table__thumb',
    ) as HTMLImageElement;
    expect(img).toBeTruthy();
    expect(img.getAttribute('src')).toBe('https://x/a.jpg');
  });
});
