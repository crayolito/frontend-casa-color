# Referencia: Componentes, Formularios y Estilos

## Componentes

- **Smart/Dumb estricto**: `ui/` = tontos (`input()`/`output()`, cero servicios de datos, cero HTTP). `feature/` = smart (orquestan estado, delegan presentación).
- `OnPush` en todo (bajo zoneless puro es redundante, pero documenta intención y protege en migraciones con Zone).
- Control flow nativo siempre: `@if`, `@for` (con `track` OBLIGATORIO), `@switch`, `@defer`. `*ngIf`/`*ngFor` solo legacy.
- `@defer` para todo lo no crítico above-the-fold: charts, modales pesados, bajo el pliegue.
- `inject()` sobre constructor injection en código nuevo. `host` en el decorador, nada de `@HostBinding`/`@HostListener`.
- Umbral de sospecha (no regla absoluta): >~200 líneas TS o >~150 de template → candidato a partir.
- Presentación repetida en template → pipe puro o `computed`; nunca método llamado en template.
- **Prohibido**: lógica de negocio en componentes (coordinan, no calculan reglas de dominio) · `any` en inputs/outputs · componentes que conocen `HttpClient` — jamás, ni "solo esta vez".
- Angular-specific de performance: `NgOptimizedImage` obligatorio en `<img>` de contenido; virtual scroll (CDK) desde ~100 filas renderizadas. Criterio general de performance: `frontend-reference/references/performance.md`.

## Formularios

- **Typed Reactive Forms** = default. Template-driven solo para lo trivial (y ahí, mejor un signal).
- Signal Forms: experimental → prohibido en producción; permitido en spikes para evaluarlo.
- Validators reutilizables en `shared/util/validators`. Mensajes de error centralizados (un componente/pipe de errores, no `@if` repetidos por campo).
- Forms grandes: sub-forms con hijos que reciben el `FormGroup` tipado, o `ControlValueAccessor` si el control es genuinamente reusable.
- Estado de submit (pending/success/error) con signals, no banderas booleanas dispersas. Botón deshabilitado durante la petición (constitución → doble submit, NO opt-in).

## Estilos y UI

- Design system primero: tokens (colores, espaciado, tipografía) como CSS custom properties desde el día 1, aunque sean 40 líneas.
- UI kit — elegir UNA opción y dejarla en ADR: Angular Material 3 + CDK (si el look Material va) · Tailwind + componentes propios sobre CDK (diseño custom — el CDK igual se usa: overlay, focus-trap, virtual scroll son la lógica difícil que no reescribís) · PrimeNG (tablas densas ya).
- Encapsulación default por componente. `::ng-deep` prohibido salvo theming de libs third-party, acotado al host.
- `styles.scss` global = reset + tokens + tipografía base, nada más. Mobile-first; breakpoints desde tokens, no números mágicos.
