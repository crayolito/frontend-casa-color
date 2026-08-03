import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { HomeApi } from '../../home/data/home.api';
import { HomeContent } from '../../home/data/home-content.model';
import { CategoriesApi } from '../data/categories.api';
import { AdminToastService } from '../../../shared/admin-ui/admin-toast/admin-toast.service';
import { AdminHome } from './admin-home';

const SAMPLE: HomeContent = {
  header: {
    imageUrl: '/logo.png',
    link: '/',
  },
  banner: {
    autoplay: true,
    intervalMs: 4000,
    slides: [{ id: '1', imageUrl: '/a.jpg', title: 'T' }],
  },
  findProduct: { title: 'Encuentra' },
  categories: { title: 'Cats', items: [] },
  footer: {
    social: {
      instagram: { show: false },
      tiktok: { show: false },
      facebook: { show: false },
    },
    copyright: { text: '©', designBy: 'Crayolito' },
  },
  floating: {
    whatsapp: { enabled: false, phone: '', message: 'Hola' },
  },
  nav: { items: [] },
};

describe('AdminHome', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminHome],
      providers: [
        provideHttpClient(),
        {
          provide: HomeApi,
          useValue: {
            content: () => SAMPLE,
            loadHome: () => of(SAMPLE),
            upsertSection: () =>
              of({ key: 'home.header', value: {}, updatedAt: new Date().toISOString() }),
          },
        },
        {
          provide: CategoriesApi,
          useValue: {
            list: () =>
              of({
                data: [
                  { id: 1, name: 'A', slug: 'a' },
                  { id: 2, name: 'B', slug: 'b' },
                  { id: 3, name: 'C', slug: 'c' },
                  { id: 4, name: 'D', slug: 'd' },
                  { id: 5, name: 'E', slug: 'e' },
                ],
                meta: { page: 1, limit: 20, total: 5, totalPages: 1 },
              }),
          },
        },
        {
          provide: AdminToastService,
          useValue: { success: () => undefined, error: () => undefined },
        },
      ],
    }).compileComponents();
  });

  it('should create', () => {
    const fixture = TestBed.createComponent(AdminHome);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('does not add more than 4 categories', () => {
    const fixture = TestBed.createComponent(AdminHome);
    fixture.detectChanges();
    const comp = fixture.componentInstance;
    for (let i = 0; i < 6; i++) {
      comp.openAddCategory();
    }
    expect(comp.categoryItems.length).toBe(4);
  });

  it('opens slide modal on add', () => {
    const fixture = TestBed.createComponent(AdminHome);
    fixture.detectChanges();
    const comp = fixture.componentInstance;
    const before = comp.slides.length;
    comp.openAddSlide();
    expect(comp.slides.length).toBe(before + 1);
    expect(comp.slideModalOpen()).toBe(true);
    expect(comp.slideEditIndex()).toBe(before);
  });
});
