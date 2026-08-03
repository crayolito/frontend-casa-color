import { DestroyRef, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { AdminFormContext } from './admin-form-context';

describe('AdminFormContext', () => {
  let ctx: AdminFormContext;
  let destroyCallbacks: Array<() => void>;

  function fakeDestroyRef(): DestroyRef {
    destroyCallbacks = [];
    return {
      onDestroy: (cb: () => void) => {
        destroyCallbacks.push(cb);
        return () => undefined;
      },
    } as DestroyRef;
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [AdminFormContext],
    });
    ctx = TestBed.inject(AdminFormContext);
  });

  it('starts clean', () => {
    expect(ctx.dirty()).toBe(false);
    expect(ctx.saving()).toBe(false);
  });

  it('mirrors dirty/saving from registered signals and delegates save/discard', () => {
    const dirty = signal(false);
    const saving = signal(false);
    const save = vi.fn();
    const discard = vi.fn();

    // register() ya hace runInInjectionContext — no requiere envoltorio.
    ctx.register({ dirty, saving, save, discard }, fakeDestroyRef());

    expect(ctx.dirty()).toBe(false);

    dirty.set(true);
    saving.set(true);
    TestBed.flushEffects();

    expect(ctx.dirty()).toBe(true);
    expect(ctx.saving()).toBe(true);

    ctx.requestSave();
    ctx.requestDiscard();
    expect(save).toHaveBeenCalledTimes(1);
    expect(discard).toHaveBeenCalledTimes(1);
  });

  it('unregister on destroy clears state', () => {
    const dirty = signal(true);
    const saving = signal(false);

    ctx.register(
      {
        dirty,
        saving,
        save: () => undefined,
        discard: () => undefined,
      },
      fakeDestroyRef(),
    );
    TestBed.flushEffects();
    expect(ctx.dirty()).toBe(true);

    for (const cb of destroyCallbacks) cb();
    expect(ctx.dirty()).toBe(false);
    expect(ctx.saving()).toBe(false);
  });
});
