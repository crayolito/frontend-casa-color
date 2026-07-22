
# Developer Experience (DX) y Tooling

## Elección de bundler

- **Webpack**: ecosistema más maduro, build/HMR más lento en proyectos grandes.
- **Vite**: ESM nativo en dev, arranque y HMR casi instantáneos; ecosistema de plugins más joven.

No recomiendes migrar de uno a otro sin un problema real de velocidad de build que lo justifique — el costo de migración sin beneficio claro es sobre-ingeniería.

## Linting y formatting — fuerza esto siempre, no lo dejes como sugerencia

- ESLint con reglas específicas del framework (`eslint-plugin-react-hooks`, `eslint-plugin-jsx-a11y`), no solo reglas genéricas.
- Prettier desacoplado de ESLint (Prettier formatea, ESLint valida lógica/patrones).
- Husky + lint-staged en pre-commit, corriendo solo sobre archivos modificados.
- CI como gate final obligatorio — el pre-commit se puede saltar (`--no-verify`), el pipeline de CI no debería poder saltarse.

## Monorepo tooling

Si el proyecto tiene múltiples paquetes reales, recomienda Nx o Turborepo para build incremental y caché de tareas (incluso caché remota compartida entre el equipo). Sin esto, un monorepo grande reconstruye todo en cada cambio, anulando el beneficio de compartir código.

## Documentación viva

- Storybook (o equivalente) para documentar componentes de forma ejecutable, no una página estática que se desactualiza.
- ADRs (Architecture Decision Records) para decisiones de arquitectura con impacto real y duradero (ej. "por qué Zustand sobre Redux") — no para decisiones menores.

## Configuración por entorno

Inyecta variables de entorno en build/deploy time por ambiente (dev/staging/prod). Nunca hardcodees, y nunca dejes que secretos sensibles terminen embebidos en el bundle del cliente — cualquier cosa en el bundle de JS es legible desde las herramientas de desarrollador del navegador. Distingue explícitamente configuración pública (puede ir al bundle) de secretos (deben resolverse en servidor).

## Cuándo NO aplicar esto — evita sobre-ingeniería

- No migres de Webpack a Vite (o viceversa) sin problema real de velocidad de build.
- No adoptes Nx/Turborepo en un proyecto de un solo paquete sin necesidad real de build incremental multi-paquete.
- No escribas ADRs para cada decisión menor (nombre de variable) — resérvalos para decisiones de arquitectura duraderas.
- No configures Storybook exhaustivo para componentes triviales de un solo uso que nunca se reutilizarán.

## Checklist antes de entregar

- [ ] ¿ESLint/Prettier configurados con reglas específicas del framework?
- [ ] ¿Existen hooks de pre-commit y gate obligatorio en CI?
- [ ] ¿La elección de bundler responde a una necesidad real medida?
- [ ] ¿El monorepo (si existe) usa build incremental?
- [ ] ¿Las variables de entorno distinguen configuración pública de secretos que nunca deben llegar al cliente?
