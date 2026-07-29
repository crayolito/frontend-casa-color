import { ComponentFixture, TestBed } from '@angular/core/testing';
import { BranchList } from './branch-list';
import { BranchWithDistance } from '../../data/contacto.models';

const SAMPLE: BranchWithDistance[] = [
  {
    id: 1,
    name: 'Sucursal Centro',
    addressLines: ['Calle Ayacucho 168'],
    phone: '+591 3 333-4101',
    email: 'centro@pinturas-colom.bo',
    hours: ['Lun–Vie 08:00–18:00', 'Sáb 08:00–13:00'],
    lat: -17.7833,
    lng: -63.1829,
    imageUrl: null,
    sortOrder: 0,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    distanceKm: 1.2,
  },
  {
    id: 2,
    name: 'Sucursal Equipetrol',
    addressLines: ['Av. San Martín 450'],
    phone: '+591 3 344-2202',
    email: 'equipetrol@pinturas-colom.bo',
    hours: ['Lun–Sáb 09:00–19:00'],
    lat: -17.7407,
    lng: -63.1659,
    imageUrl: null,
    sortOrder: 1,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    distanceKm: 3.5,
  },
];

describe('BranchList', () => {
  let fixture: ComponentFixture<BranchList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BranchList],
    }).compileComponents();

    fixture = TestBed.createComponent(BranchList);
    fixture.componentRef.setInput('branches', SAMPLE);
    fixture.componentRef.setInput('selectedId', null);
    await fixture.whenStable();
  });

  it('should render one button per branch', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('.branch-list__item').length).toBe(2);
  });

  it('should emit select with the branch id on click', () => {
    const emitted: number[] = [];
    fixture.componentInstance.select.subscribe((id) => emitted.push(id));

    const compiled = fixture.nativeElement as HTMLElement;
    const buttons = compiled.querySelectorAll(
      '.branch-list__item',
    ) as NodeListOf<HTMLButtonElement>;
    buttons[1].click();

    expect(emitted).toEqual([2]);
  });

  it('should show distance when available', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const distances = Array.from(
      compiled.querySelectorAll('.branch-list__distance'),
    ).map((el) => el.textContent?.trim());
    expect(distances).toEqual(['1.2 km', '3.5 km']);
  });

  it('should render hours for each branch', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const hours = Array.from(
      compiled.querySelectorAll('.branch-list__hours'),
    ).map((el) => el.textContent?.replace(/\s+/g, ' ').trim());
    expect(hours[0]).toContain('Lun–Vie 08:00–18:00');
    expect(hours[1]).toContain('Lun–Sáb 09:00–19:00');
  });
});
