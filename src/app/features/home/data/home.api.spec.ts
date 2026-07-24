import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { ApiService } from '../../../core/http/api.service';
import { HomeApi } from './home.api';
import { HomeContent } from './home-content.model';

const SAMPLE: HomeContent = {
  header: {
    imageUrl: '/logo.png',
    altText: 'Casa Color',
  },
  banner: { autoplay: true, intervalMs: 4000, slides: [] },
  findProduct: { title: 'x' },
  categories: { title: 'y', items: [] },
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

describe('HomeApi', () => {
  let api: HomeApi;
  let lastGetUrl: string | null = null;
  let lastGetParams: Record<string, unknown> | undefined;

  beforeEach(() => {
    lastGetUrl = null;
    lastGetParams = undefined;
    TestBed.configureTestingModule({
      providers: [
        HomeApi,
        {
          provide: ApiService,
          useValue: {
            get: (url: string, params?: Record<string, unknown>) => {
              lastGetUrl = url;
              lastGetParams = params;
              return of(SAMPLE);
            },
            put: () => of({}),
          },
        },
      ],
    });
    api = TestBed.inject(HomeApi);
  });

  it('loadHome fills content signal and cache-busts', () => {
    api.loadHome().subscribe();
    expect(lastGetUrl).toBe('/public/home');
    expect(typeof lastGetParams?.['_ts']).toBe('number');
    expect(api.content()).toEqual(SAMPLE);
  });
});
