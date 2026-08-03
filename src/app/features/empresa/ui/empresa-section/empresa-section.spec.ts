import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EmpresaSection } from '../../data/empresa.model';
import { EmpresaSectionComponent } from './empresa-section';

const SECTION: EmpresaSection = {
  id: 'sec-1',
  title: 'Calidad y tecnología',
  titleColor: '#dd3333',
  descriptionHtml: '<p>Texto de la empresa.</p>',
  sideImageUrl: 'https://cdn.example/side.jpg',
  sortOrder: 0,
};

describe('EmpresaSectionComponent', () => {
  let fixture: ComponentFixture<EmpresaSectionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmpresaSectionComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EmpresaSectionComponent);
    fixture.componentRef.setInput('section', SECTION);
    fixture.detectChanges();
  });

  it('renders title, divider and description (no side image — page owns logo)', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.empresa-section__title')?.textContent).toContain(
      'Calidad y tecnología',
    );
    expect(el.querySelector('.empresa-section__title strong')).toBeTruthy();
    expect(el.querySelector('.empresa-section__divider')).toBeTruthy();
    expect(el.textContent).toContain('Texto de la empresa');
    expect(el.querySelector('.empresa-section__side')).toBeNull();
    expect(el.querySelector('.empresa-section__large')).toBeNull();
  });
});
