import {
  DestroyRef,
  EffectRef,
  Injectable,
  Injector,
  Signal,
  computed,
  effect,
  inject,
  runInInjectionContext,
  signal,
} from '@angular/core';

export interface AdminFormRegistration {
  dirty: Signal<boolean>;
  saving: Signal<boolean>;
  save: () => void;
  discard: () => void;
}

/**
 * Puente entre el form activo (router-outlet) y el topbar (hermano).
 * El form se registra al montarse; el topbar lee dirty/saving y dispara save/discard.
 */
@Injectable({ providedIn: 'root' })
export class AdminFormContext {
  private readonly injector = inject(Injector);
  private readonly _dirty = signal(false);
  private readonly _saving = signal(false);
  private _save: (() => void) | null = null;
  private _discard: (() => void) | null = null;
  private syncEffect: EffectRef | null = null;

  readonly dirty = computed(() => this._dirty());
  readonly saving = computed(() => this._saving());

  /**
   * Registra el form activo. Seguro desde ngOnInit (usa runInInjectionContext).
   * Al destruir el form se limpia solo.
   */
  register(opts: AdminFormRegistration, destroyRef: DestroyRef): void {
    this.unregister();
    this._save = opts.save;
    this._discard = opts.discard;
    // ngOnInit no es injection context — sin esto → NG0203.
    this.syncEffect = runInInjectionContext(this.injector, () =>
      effect(() => {
        this._dirty.set(opts.dirty());
        this._saving.set(opts.saving());
      }),
    );
    destroyRef.onDestroy(() => this.unregister());
  }

  unregister(): void {
    this.syncEffect?.destroy();
    this.syncEffect = null;
    this._dirty.set(false);
    this._saving.set(false);
    this._save = null;
    this._discard = null;
  }

  requestSave(): void {
    this._save?.();
  }

  requestDiscard(): void {
    this._discard?.();
  }
}
