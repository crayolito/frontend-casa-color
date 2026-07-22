---
name: frontend-reference
description: Índice de referencias técnicas de frontend (estándares de código, CSS/responsividad, estado, performance/Core Web Vitals, accesibilidad, seguridad frontend, resiliencia, testing, observabilidad, arquitectura a escala, DX/tooling, i18n/SEO). Agnóstico de framework — el criterio es el mismo en React, Next, Vue, Angular o Svelte; cambia la sintaxis. Cargar la referencia puntual cuando una fase del SDD la necesita o cuando la tarea toca UI. No es un workflow.
---

# Referencias de frontend (divulgación progresiva)

Este skill NO define proceso (eso está en `sdd-workflow.mdc`) ni reglas siempre-activas (eso está en `constitution.mdc` y `frontend-layers.mdc`).
Solo guarda el criterio detallado. Cargá SOLO la referencia que la tarea necesita — nunca todas juntas.

> Regla en todas (igual que backend): si el proyecto ya tiene un ejemplo del mismo patrón, seguí ESE, no el de la referencia.
> Framework-agnóstico: donde una referencia dice `useEffect`/`v-html`/`Error Boundary`, aplicá el equivalente del framework del proyecto. El criterio no cambia.
> **Fuente única de verdad:** el criterio vive ACÁ (en las referencias). `frontend-layers.mdc` solo resume y apunta. Ante contradicción, la referencia manda.

## Estatus de cada referencia — respetá la simetría con la constitución

- **Siempre activas (NO opt-in):** `security.md`, `accessibility.md` (baseline AA). Misma lógica que la sección Seguridad de la constitución: omitirlas no es deuda, es exploit / exclusión de usuarios.
- **Por defecto al escribir código de UI:** `code-standards.md`, `css-responsive.md`, `state-data.md`, `error-resilience.md` (nivel proporcional a criticidad del flujo).
- **Cuando la tarea lo dispara:** `performance.md`, `architecture-scale.md`, `dx-tooling.md`, `i18n-seo-pwa.md`.
- **Obligatoria en implementación nueva (constitución → Testing):** `testing.md` — happy path ejecutado; recovery en camino crítico. **OPT-IN:** `observability.md` (logging de seguridad nunca).

| Archivo | Cargar cuando la tarea involucra... |
|---|---|
| `references/code-standards.md` | Escribir/refactorizar componentes, hooks/composables, naming, patrones (Container/Presentational, Facade, Provider), estructura de carpetas |
| `references/css-responsive.md` | CSS, estilos, media/container queries, layouts responsivos, elegir CSS Modules/CSS-in-JS/Tailwind |
| `references/state-data.md` | Dónde guardar un dato (local/global/servidor), fetch, React Query/SWR/Pinia, formularios, filtros, paginación, optimistic updates |
| `references/performance.md` | Estrategia de renderizado (CSR/SSR/SSG/ISR), code splitting, lazy loading, bundle, Core Web Vitals (LCP/INP/CLS) |
| `references/accessibility.md` | Cualquier componente interactivo nuevo (botones, modales, forms, navegación), routing SPA — **baseline AA siempre activa** |
| `references/security.md` | HTML dinámico (innerHTML/v-html), tokens en cliente, CSP, scripts de terceros, CORS, formularios — **NO opt-in: aplica siempre** |
| `references/error-resilience.md` | Llamadas de red, submits, Error Boundaries, reintentos, fallback UI — nivel proporcional a criticidad del flujo |
| `references/testing.md` | Tests frontend (Testing Trophy, Testing Library, MSW) — **obligatorio en implementación nueva** (constitución → Testing) |
| `references/observability.md` | Error tracking, RUM, source maps, alertas — **solo si el dev lo pidió** (opt-in; enmascarado de Replay no) |
| `references/architecture-scale.md` | Micro-frontends, monorepos, Nx/Turborepo, Module Federation, estructura multi-equipo |
| `references/dx-tooling.md` | ESLint/Prettier, bundler, pre-commit hooks, Storybook, variables de entorno por ambiente |
| `references/i18n-seo-pwa.md` | Internacionalización, meta tags/SEO, cross-browser, Service Workers/PWA, design tokens |

## Fronteras con backend-reference — no dupliques criterio

- **Seguridad**: `backend-reference/references/security.md` = el servidor decide (authz, validación real, secretos). `frontend-reference/references/security.md` = la superficie cliente (XSS, tokens en browser, CSP, SRI). Son complementarias; en una feature full-stack se cargan las dos.
- **Testing**: pirámide clásica sigue siendo válida en backend con dominio pesado; Testing Trophy es el default frontend. No cruces los modelos.
- **API design, errores de negocio, transacciones**: viven en backend-reference. El frontend consume el contrato `{ data } / { error: { code } }` definido ahí — no inventa otro.
- **Comentarios en código**: cross-stack, vive en `.cursor/skills/code-comments/SKILL.md`, no acá.
