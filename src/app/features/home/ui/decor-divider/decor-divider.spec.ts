import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DEFAULT_IMAGES } from '../../../../shared/util/default-images';
import { DecorDivider } from './decor-divider';

describe('DecorDivider', () => {
  let fixture: ComponentFixture<DecorDivider>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DecorDivider],
    }).compileComponents();
    fixture = TestBed.createComponent(DecorDivider);
  });

  it('uses auxiliar fallback when imageUrl is empty', async () => {
    fixture.componentRef.setInput('imageUrl', '');
    await fixture.whenStable();
    const img = fixture.nativeElement.querySelector(
      'img',
    ) as HTMLImageElement;
    expect(img.getAttribute('src')).toBe(DEFAULT_IMAGES.product);
  });

  it('uses provided imageUrl when set', async () => {
    fixture.componentRef.setInput('imageUrl', '/uploads/decor.png');
    await fixture.whenStable();
    const img = fixture.nativeElement.querySelector(
      'img',
    ) as HTMLImageElement;
    expect(img.getAttribute('src')).toBe('/uploads/decor.png');
  });
});
