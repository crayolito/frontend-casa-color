import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { Component } from '@angular/core';
import { ImgFallback } from './img-fallback';
import { DEFAULT_IMAGES } from '../default-images';

@Component({
  standalone: true,
  imports: [ImgFallback],
  template: `<img [src]="src" [appImgFallback]="kind" />`,
})
class Host {
  src = '/broken.jpg';
  kind: 'product' | 'category' | 'catalog' | 'logo' = 'product';
}

describe('ImgFallback', () => {
  let fixture: ComponentFixture<Host>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Host],
    }).compileComponents();
    fixture = TestBed.createComponent(Host);
    fixture.detectChanges();
  });

  it('swaps to product fallback on error', () => {
    const img = fixture.debugElement.query(By.css('img')).nativeElement as HTMLImageElement;
    img.dispatchEvent(new Event('error'));
    expect(img.src).toContain(DEFAULT_IMAGES.product.replace(/^\//, ''));
  });

  it('swaps only once', () => {
    fixture.componentInstance.kind = 'category';
    fixture.detectChanges();
    const img = fixture.debugElement.query(By.css('img')).nativeElement as HTMLImageElement;
    img.dispatchEvent(new Event('error'));
    const first = img.src;
    img.dispatchEvent(new Event('error'));
    expect(img.src).toBe(first);
  });
});
