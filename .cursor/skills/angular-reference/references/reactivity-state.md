# Referencia: Reactividad y Estado en Angular

## Signals vs RxJS — regla madre

Signals para **estado**. RxJS para **eventos en el tiempo**. Puente: `toSignal()` / `toObservable()`.

| Caso | Herramienta |
|---|---|
| Estado de componente/feature | `signal()`, `computed()`, `linkedSignal()` |
| Inputs/outputs | `input()`, `output()`, `model()` — nunca decoradores legacy |
| Datos del servidor | `httpResource()` / `resource()` |
| Debounce/typeahead | RxJS (`debounceTime`, `switchMap`) → `toSignal()` |
| WebSockets, streams, polling, orquestación de eventos | RxJS |
| Sincronizar dos signals | `computed()` o `linkedSignal()` — JAMÁS `effect()` seteando otro signal |

## Reglas duras

- **`effect()` es último recurso**: solo sincronización con el mundo exterior (localStorage, libs third-party, logging). Un `effect` que escribe estado = bug de diseño.
- **Cada `subscribe()` manual se defiende en review.** Casi siempre existe `toSignal`, `async` pipe, `resource` o `takeUntilDestroyed()`. Si sobrevive → `takeUntilDestroyed()` obligatorio.
- Servicios exponen estado `readonly` como `Signal<T>` (no `WritableSignal`): consumidores leen, solo el dueño escribe.
- Zoneless: si algo no se actualiza en pantalla, el estado no era un signal — ese es el diagnóstico. `ChangeDetectorRef.detectChanges()` manual = síntoma, no fix.

## Escalera de estado — subir SOLO con dolor real

1. **Local de componente** → signals en el componente (≈70% de los casos).
2. **Compartido dentro de la feature** → servicio con signals en `state/`, provisto en las rutas de la feature.
3. **Compartido entre features** → primero preguntá: ¿es estado de cliente o **cache de servidor**? La mayoría del "estado global" es cache de servidor → `httpResource`/TanStack Query, NO un store.
4. **Estado de cliente global y complejo de verdad** (carrito multi-flujo, undo/redo) → **NgRx SignalStore**. El NgRx clásico actions/reducers/effects en proyecto nuevo = boilerplate injustificable.

Reglas: prohibido store global "porque vamos a crecer". Estado de servidor lleva loading, error e invalidación explícitos — nada de `isLoading` booleanos multiplicándose. **La URL es estado**: filtros, paginación, tab seleccionado → query params (shareable, sobrevive refresh, gratis), no un store.
