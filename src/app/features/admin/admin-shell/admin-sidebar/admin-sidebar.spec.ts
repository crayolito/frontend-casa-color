import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AdminSidebar } from './admin-sidebar';

describe('AdminSidebar', () => {
  let fixture: ComponentFixture<AdminSidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminSidebar],
      providers: [provideRouter([])],
    }).compileComponents();
    fixture = TestBed.createComponent(AdminSidebar);
    fixture.detectChanges();
  });

  it('does not render sesión activa footer', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).not.toContain('Sesión activa');
    expect(el.querySelector('.admin-sidebar__footer')).toBeNull();
  });
});
