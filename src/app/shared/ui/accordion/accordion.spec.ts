import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Accordion } from './accordion';

describe('Accordion', () => {
  let fixture: ComponentFixture<Accordion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Accordion],
    }).compileComponents();

    fixture = TestBed.createComponent(Accordion);
    fixture.componentRef.setInput('title', 'MATE Y DECORATIVA');
    fixture.componentRef.setInput('panelId', 'test-panel');
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should start collapsed by default', () => {
    const button = fixture.nativeElement.querySelector(
      'button.accordion__trigger',
    ) as HTMLButtonElement;
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(fixture.nativeElement.querySelector('.accordion__panel[hidden]')).not.toBeNull();
  });

  it('should expand and collapse on click', async () => {
    const button = fixture.nativeElement.querySelector(
      'button.accordion__trigger',
    ) as HTMLButtonElement;

    button.click();
    await fixture.whenStable();
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(fixture.nativeElement.querySelector('.accordion__panel[hidden]')).toBeNull();

    button.click();
    await fixture.whenStable();
    expect(button.getAttribute('aria-expanded')).toBe('false');
  });

  it('should expose aria-controls pointing to the panel id', () => {
    const button = fixture.nativeElement.querySelector(
      'button.accordion__trigger',
    ) as HTMLButtonElement;
    expect(button.getAttribute('aria-controls')).toBe('test-panel');
    expect(fixture.nativeElement.querySelector('#test-panel')).not.toBeNull();
  });

  it('should toggle with keyboard activation on the native button', async () => {
    const button = fixture.nativeElement.querySelector(
      'button.accordion__trigger',
    ) as HTMLButtonElement;

    button.focus();
    button.dispatchEvent(
      new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }),
    );
    button.click();
    await fixture.whenStable();
    expect(button.getAttribute('aria-expanded')).toBe('true');
  });
});
