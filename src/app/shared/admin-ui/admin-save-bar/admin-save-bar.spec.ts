import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminSaveBar } from './admin-save-bar';

describe('AdminSaveBar', () => {
  let fixture: ComponentFixture<AdminSaveBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminSaveBar],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminSaveBar);
    await fixture.whenStable();
  });

  it('should not render when not dirty', () => {
    fixture.componentRef.setInput('dirty', false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.admin-save-bar')).toBeNull();
  });

  it('should render when dirty', async () => {
    fixture.componentRef.setInput('dirty', true);
    await fixture.whenStable();
    expect(fixture.nativeElement.querySelector('.admin-save-bar')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('[aria-live="polite"]')).toBeTruthy();
  });

  it('should emit save and discard', async () => {
    fixture.componentRef.setInput('dirty', true);
    await fixture.whenStable();

    let saved = false;
    let discarded = false;
    fixture.componentInstance.save.subscribe(() => {
      saved = true;
    });
    fixture.componentInstance.discard.subscribe(() => {
      discarded = true;
    });

    const buttons = fixture.nativeElement.querySelectorAll('button');
    (buttons[0] as HTMLButtonElement).click();
    expect(discarded).toBe(true);

    (buttons[1] as HTMLButtonElement).click();
    expect(saved).toBe(true);
  });
});
