import { TestBed } from '@angular/core/testing';
import { AdminScrollLockService } from './admin-scroll-lock.service';

describe('AdminScrollLockService', () => {
  let service: AdminScrollLockService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AdminScrollLockService);
  });

  it('locks on acquire and unlocks when all released', () => {
    expect(service.locked()).toBe(false);
    service.acquire();
    expect(service.locked()).toBe(true);
    service.acquire();
    expect(service.locked()).toBe(true);
    service.release();
    expect(service.locked()).toBe(true);
    service.release();
    expect(service.locked()).toBe(false);
  });

  it('does not go negative on extra release', () => {
    service.release();
    expect(service.locked()).toBe(false);
    service.acquire();
    expect(service.locked()).toBe(true);
    service.release();
    service.release();
    expect(service.locked()).toBe(false);
  });
});
