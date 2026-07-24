import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { of } from 'rxjs';
import { App } from './app';
import { HomeApi } from './features/home/data/home.api';
import { HomeContent } from './features/home/data/home-content.model';

describe('App', () => {
  const content = signal<HomeContent | null>({
    header: { imageUrl: '', altText: '' },
    banner: { autoplay: false, intervalMs: 4000, slides: [] },
    findProduct: { title: '' },
    categories: { title: '', items: [] },
    footer: {
      social: {
        whatsapp: { show: false },
        instagram: { show: false },
        tiktok: { show: false },
        facebook: { show: false },
      },
      copyright: { text: '©', designBy: 'x' },
    },
    floating: {
      whatsapp: { enabled: true, phone: '34600111222', message: 'Hola' },
    },
    nav: { items: [] },
  });

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([
          { path: '', children: [] },
          { path: 'admin', children: [] },
          { path: 'admin/**', children: [] },
        ]),
        {
          provide: HomeApi,
          useValue: {
            content,
            loadHome: () => of(content()),
          },
        },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render a router outlet', async () => {
    const fixture = TestBed.createComponent(App);
    await fixture.whenStable();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('router-outlet')).not.toBeNull();
  });

  it('showFab is false on /admin even with WhatsApp enabled', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/admin');
    fixture.detectChanges();
    expect(fixture.componentInstance['showFab']()).toBe(false);
  });

  it('showFab is true on public path when WhatsApp enabled', async () => {
    const fixture = TestBed.createComponent(App);
    const router = TestBed.inject(Router);
    await router.navigateByUrl('/');
    fixture.detectChanges();
    expect(fixture.componentInstance['showFab']()).toBe(true);
  });
});
