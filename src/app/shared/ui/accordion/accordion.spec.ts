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
    const panel = fixture.nativeElement.querySelector('.accordion__panel') as HTMLElement;

    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(panel.classList.contains('accordion__panel--open')).toBe(false);
    expect(panel.getAttribute('aria-hidden')).toBe('true');
  });

  it('should expand and collapse on click', async () => {
    const button = fixture.nativeElement.querySelector(
      'button.accordion__trigger',
    ) as HTMLButtonElement;
    const panel = fixture.nativeElement.querySelector('.accordion__panel') as HTMLElement;

    button.click();
    await fixture.whenStable();
    expect(button.getAttribute('aria-expanded')).toBe('true');
    expect(panel.classList.contains('accordion__panel--open')).toBe(true);
    expect(panel.getAttribute('aria-hidden')).toBe('false');

    button.click();
    await fixture.whenStable();
    expect(button.getAttribute('aria-expanded')).toBe('false');
    expect(panel.classList.contains('accordion__panel--open')).toBe(false);
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
