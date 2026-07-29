import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { HomeApi } from '../data/home.api';
import { HomeContent } from '../data/home-content.model';
import { Home } from './home';

const SAMPLE: HomeContent = {
  header: {
    imageUrl: '/logo.png',
    altText: 'Casa Color',
  },
  banner: {
    autoplay: false,
    intervalMs: 4000,
    slides: [
      {
        id: '1',
        imageUrl: '/a.jpg',
        title: 'Hola',
        buttonText: 'Ver',
        buttonLink: '/cartas-de-color',
      },
    ],
  },
  findProduct: { title: 'Encuentra' },
  categories: { title: 'Cats', items: [] },
  footer: {
    social: {
      whatsapp: { show: false },
      instagram: { show: false },
      tiktok: { show: false },
      facebook: { show: false },
    },
    copyright: { text: '©', designBy: 'Crayolito' },
  },
  floating: { whatsapp: { enabled: false } },
  nav: { items: [] },
};

describe('Home', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Home],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        {
          provide: HomeApi,
          useValue: {
            content: () => null,
            loadHome: () => of(SAMPLE),
            upsertSection: () => of({}),
          },
        },
      ],
    }).compileComponents();
  });

  it('should create and load content', () => {
    const fixture = TestBed.createComponent(Home);
    fixture.detectChanges();
    expect(fixture.componentInstance).toBeTruthy();
  });
});
