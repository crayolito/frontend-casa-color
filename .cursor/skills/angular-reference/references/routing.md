# Referencia: Routing

- Lazy por feature: `loadChildren` → `<feature>.routes.ts`. Sin excepciones.
- Guards y resolvers **funcionales** (`CanActivateFn`), no clases.
- Providers de feature en sus rutas (`providers: [...]`): el estado de la feature vive y muere con ella.
- Rutas tipadas por constantes/helpers centralizados. Strings mágicos repetidos = bug con fecha.
- Lo que define la vista (filtros, página, orden, selección) → query params, no store (ver reactivity-state → "la URL es estado").
- `withComponentInputBinding()` activado: los params llegan como `input()`, no inyectando `ActivatedRoute` en cada componente.
- SSR/hydration es DECISIÓN con ADR, no default: SÍ para contenido público/SEO/e-commerce (con hydration incremental); NO para dashboards tras login/back-office (complejidad sin retorno).
