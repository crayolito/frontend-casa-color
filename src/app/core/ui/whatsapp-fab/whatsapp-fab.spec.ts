import { ComponentFixture, TestBed } from '@angular/core/testing';
import { WhatsappFab } from './whatsapp-fab';

describe('WhatsappFab', () => {
  let fixture: ComponentFixture<WhatsappFab>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [WhatsappFab],
    }).compileComponents();
    fixture = TestBed.createComponent(WhatsappFab);
  });

  it('does not render when disabled', () => {
    fixture.componentRef.setInput('floating', {
      whatsapp: { enabled: false, phone: '59170000000' },
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('a')).toBeNull();
  });

  it('renders wa.me link when enabled with phone', () => {
    fixture.componentRef.setInput('floating', {
      whatsapp: {
        enabled: true,
        phone: '59170000000',
        message: 'Hola',
      },
    });
    fixture.detectChanges();
    const link = fixture.nativeElement.querySelector('a') as HTMLAnchorElement;
    expect(link).toBeTruthy();
    expect(link.href).toContain('wa.me/59170000000');
    expect(link.href).toContain('text=Hola');
  });
});
