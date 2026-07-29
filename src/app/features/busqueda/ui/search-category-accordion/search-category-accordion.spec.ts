import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { SearchCategoryGroup } from '../../util/search-category-group';
import { SearchCategoryAccordion } from './search-category-accordion';

const GROUPS: SearchCategoryGroup[] = [
  {
    id: 1,
    name: 'Decoración',
    slug: 'decoracion',
    catalogs: [
      { id: 10, name: 'Línea Deco', slug: 'linea-deco' },
      { id: 11, name: 'Mate', slug: 'mate' },
    ],
  },
  {
    id: 2,
    name: 'Industria',
    slug: 'industria',
    catalogs: [],
  },
];

describe('SearchCategoryAccordion', () => {
  let fixture: ComponentFixture<SearchCategoryAccordion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchCategoryAccordion],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(SearchCategoryAccordion);
    fixture.componentRef.setInput('groups', GROUPS);
    fixture.detectChanges();
  });

  it('renders a panel per category group', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Decoración');
    expect(el.textContent).toContain('Industria');
    expect(el.querySelectorAll('app-accordion').length).toBe(2);
  });

  it('lists catalog links without legales/NAV_ITEMS labels', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Línea Deco');
    expect(el.textContent).toContain('Mate');
    expect(el.textContent).not.toContain('DOCUMENTACIÓN');
    expect(el.textContent).not.toContain('Aviso legal');
    expect(el.querySelector('a[href="/catalogo/linea-deco"]')).toBeTruthy();
  });

  it('shows empty message when groups is empty', () => {
    fixture.componentRef.setInput('groups', []);
    fixture.detectChanges();
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Sin categorías');
  });
});
