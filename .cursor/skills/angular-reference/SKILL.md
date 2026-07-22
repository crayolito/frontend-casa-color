---
name: angular-reference
description: Referencias técnicas específicas de Angular (v22+, signals, zoneless, standalone) para crear proyectos nuevos o intervenir existentes. Cargar SOLO si el proyecto ES Angular — señales: existe angular.json, @angular/core en package.json, archivos *.component.ts, o el dev menciona Angular explícitamente. NO cargar en proyectos React, Next, Vue, Svelte ni de otro framework (ahí aplica solo frontend-reference genérico). No es un workflow.
---

# Referencias de Angular (divulgación progresiva)

Este skill NO define proceso (eso está en `sdd-workflow.mdc`) ni política (eso está en `constitution.mdc`).
Guarda el criterio específico de Angular. Cargá SOLO la referencia que la tarea necesita — nunca todas.

> **Precedencia (constitución → Frontend):** constitución > esta skill > `frontend-reference` genérico.
> Esta skill manda en lo ESPECÍFICO del framework (sintaxis, APIs, estructura, herramientas, CÓMO se testea).
> La constitución manda en POLÍTICA (QUÉ se testea, seguridad, a11y, gates de verify) — eso no cambia por framework.
> Si el proyecto ya tiene un ejemplo del mismo patrón, seguí ESE, no el de la referencia.

## No dupliques con frontend-reference

Criterio genérico (patrones Container/Presentational, seguridad de superficie cliente, a11y, CSS, performance conceptual) vive en `.cursor/skills/frontend-reference/`. Acá solo van los DELTAS de Angular. En una tarea Angular se cargan: el índice genérico + la referencia Angular puntual — nunca los dos árboles completos.

| Archivo | Cargar cuando la tarea involucra... |
|---|---|
| `references/architecture.md` | Estructura de carpetas, boundaries entre features, core/shared, decidir qué escala cuándo (Sheriff/Nx) |
| `references/reactivity-state.md` | Signals vs RxJS, effect(), estado local/feature/global, escalera de decisión de stores, httpResource |
| `references/components-forms.md` | Componentes smart/dumb, control flow (@if/@for/@defer), inject(), Typed Reactive Forms, estilos/theming |
| `references/data-http.md` | Servicios HTTP, DTOs, mappers en la frontera, interceptors, AppError normalizado |
| `references/routing.md` | Rutas lazy, guards/resolvers funcionales, providers por feature, query params como estado |
| `references/auth-session.md` | Login, refresh token, expiración, logout, guard de sesión — el flujo COMPLETO |
| `references/error-ux.md` | Qué VE el usuario ante un error: toast vs página vs retry — criterio por tipo de error |
| `references/testing.md` | Cómo se testea EN Angular (Vitest, Testing Library, provideHttpClientTesting) — el QUÉ es obligatorio lo define la constitución → Testing |
| `references/cli.md` | Comandos ng: crear proyecto, generar, actualizar, correr tests, build — `sdd-apply` la carga al implementar |
| `references/environments-deploy.md` | Configs por ambiente sin secretos en bundle, budgets, build de producción |
| `references/security-a11y-angular.md` | SOLO deltas Angular (sanitizer, bypassSecurityTrust, CDK a11y, i18n) — el criterio base es de frontend-reference y NO es opt-in |
| `references/checklists.md` | Día 0 de proyecto nuevo · primera semana entrando a un proyecto existente (para `sdd-audit`/`sdd-explore`) |

## Decisiones ya tomadas por el equipo (no re-litigar en cada proyecto)

- **E2E: NO se usa** (decisión de equipo). Si algún día entra: Playwright. Ninguna referencia lo exige.
- Testing: Vitest + Angular Testing Library. Karma/Jasmine/Protractor: muertos, ni en legacy nuevo.
- Standalone + zoneless + signals en todo código nuevo. NgModules solo en legacy no migrado.
