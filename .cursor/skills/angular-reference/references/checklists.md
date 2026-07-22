# Referencia: Checklists operativos

## CREAR proyecto nuevo (día 0) — la usa `sdd-apply` en greenfield Angular

- [ ] `ng new` última estable: standalone, zoneless, SCSS, routing (comandos exactos: `cli.md`).
- [ ] `tsconfig` estricto completo: `strict`, `noUncheckedIndexedAccess`, `strictTemplates`.
- [ ] angular-eslint + Prettier + Sheriff (boundaries) + husky/lint-staged en pre-commit. `no-explicit-any` como ERROR.
- [ ] Estructura de carpetas de `architecture.md` creada, aunque las features estén vacías.
- [ ] CI mínimo desde el commit 1: lint → typecheck → test → build prod (`environments-deploy.md`).
- [ ] Interceptors base (auth, errores) + `AppError` normalizado + catálogo de mensajes (`data-http.md`, `error-ux.md`).
- [ ] Tokens de design system (aunque sean 20 líneas) + UI kit decidido en ADR-001.
- [ ] SSR sí/no → ADR-002. i18n → ADR-003 (`security-a11y-angular.md`).
- [ ] Error tracking + source maps en pipeline.
- [ ] Budgets de bundle en `angular.json`.
- [ ] README que permite a un dev nuevo correr todo en < 15 minutos.

## ENTRAR a proyecto existente (primera semana) — la usan `sdd-explore`/`sdd-audit` en Angular

**Radiografía (día 1):**
- [ ] Versión de Angular y distancia a la estable. ¿Zone.js o zoneless? ¿Standalone o NgModules?
- [ ] `tsconfig`: ¿estricto? Si no → PRIMER item del backlog técnico.
- [ ] ¿Compila y los tests pasan desde un clone fresco? Tribal knowledge de onboarding → documentar YA.

**Arquitectura real, no la del README (días 2-3):**
- [ ] Carpetas reales vs features del negocio. ¿Boundaries o grafo libre de imports?
- [ ] Buscar y ANOTAR FRECUENCIA (cada hallazgo es síntoma): `subscribe(` sin gestión de ciclo de vida · servicios-dios · `any` · `::ng-deep` · `detectChanges()` manual · `effect()` escribiendo signals.
- [ ] ¿Componentes tocan HTTP directo? ¿Hay mappers o los DTOs viajan hasta los templates?
- [ ] Bundle inicial + ¿lazy loading real? `source-map-explorer` dice la verdad en 10 minutos.

**Proceso y riesgo (días 4-5):**
- [ ] CI: ¿qué bloquea un merge DE VERDAD? ¿Flaky tests ignorados sistemáticamente?
- [ ] `npm audit`, paquetes abandonados, versiones pinneadas sin razón.
- [ ] ¿Existen ADRs o el porqué vive en cabezas? Entrevistar a los seniors ANTES de proponer.
- [ ] Entregable: 3 riesgos top + quick wins + plan incremental. **PROHIBIDO proponer big-bang rewrite en la semana 1** — el legacy que funciona en producción sabe cosas que vos todavía no (alineado con constitución → código existente y sdd-audit).
