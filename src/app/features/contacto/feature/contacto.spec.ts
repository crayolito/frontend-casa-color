import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Contacto } from './contacto';
import { BRANCHES } from '../util/contacto-data';

describe('Contacto', () => {
  let fixture: ComponentFixture<Contacto>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Contacto],
    }).compileComponents();

    fixture = TestBed.createComponent(Contacto);
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render header and footer', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-header')).toBeTruthy();
    expect(compiled.querySelector('app-footer')).toBeTruthy();
  });

  it('should render three contact info blocks', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('app-contact-info-block').length).toBe(3);
  });

  it('should render seven branches in the list', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const items = compiled.querySelectorAll('.branch-list__item');
    expect(items.length).toBe(BRANCHES.length);
    expect(items.length).toBe(7);
  });
});
