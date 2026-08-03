import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AdminIconButton } from './admin-icon-button';

describe('AdminIconButton', () => {
  let fixture: ComponentFixture<AdminIconButton>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminIconButton],
    }).compileComponents();

    fixture = TestBed.createComponent(AdminIconButton);
    fixture.componentRef.setInput('icon', 'edit');
    fixture.componentRef.setInput('label', 'Editar');
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should set aria-label and title from label', () => {
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.getAttribute('aria-label')).toBe('Editar');
    expect(button.getAttribute('title')).toBe('Editar');
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

  it('should disable when disabled input is true', async () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    await fixture.whenStable();
    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });
});
