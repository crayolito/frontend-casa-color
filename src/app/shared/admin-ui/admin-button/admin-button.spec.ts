import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminButton } from './admin-button';

describe('AdminButton', () => {
  let fixture: ComponentFixture<AdminButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminButton],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminButton);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should emit clicked on click', () => {
    let emitted = false;
    fixture.componentInstance.clicked.subscribe(() => {
      emitted = true;
    });
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();
    expect(emitted).toBe(true);
  });

  it('should disable when loading', async () => {
    fixture.componentRef.setInput('loading', true);
    await fixture.whenStable();
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });
});
