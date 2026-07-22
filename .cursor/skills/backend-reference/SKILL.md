---
name: backend-reference
description: Índice de referencias técnicas de backend (SOLID/Clean Architecture, API design, manejo de errores, seguridad, logging, testing) con ejemplos en pseudocódigo agnóstico. Cargar la referencia puntual cuando una fase del SDD la necesita. No es un workflow.
---

# Referencias de backend (divulgación progresiva)

Este skill NO define proceso (eso está en `sdd-workflow.mdc`) ni reglas (eso está en `constitution.mdc`).
Solo guarda el criterio detallado con ejemplos. Cargá SOLO la referencia que la tarea necesita.

> Regla en todas: si el proyecto ya tiene un ejemplo del mismo patrón, seguí ESE, no el de la referencia.

| Archivo | Cargar cuando la tarea involucra... |
|---|---|
| `references/solid-clean-arch.md` | Diseño de clases, capas, dependencias, estructura, transacciones/Unit of Work |
| `references/patterns.md` | Elegir un patrón de diseño (Repository, DI, Decorator, Observer, Middleware) — señal→patrón→capa→cuándo NO |
| `references/ddd.md` | Dominio complejo: Value Objects, aggregates, domain events — **opt-in, solo si el dominio lo amerita** |
| `references/api-design.md` | Endpoints, rutas, respuestas, códigos HTTP, paginación, idempotencia, versionado |
| `references/error-handling.md` | Manejo de errores, validaciones, excepciones, respuestas de error |
| `references/security.md` | Autenticación, autorización, input, datos sensibles, endpoints públicos — **NO es opt-in: aplica siempre** |
| `references/refactor-legacy.md` | Refactor o intervención de legacy de riesgo medio/alto — caracterización, seam, strangler, tranching. **Se carga cuando `explore` marcó riesgo medio/alto.** |
| `references/logging.md` | Logging/observabilidad — **solo si el dev lo pidió** (opt-in). El logging de eventos de seguridad NO entra acá: va en `security.md` y es siempre. |
| `references/testing.md` | Tests — **obligatorio en implementación nueva** (constitución → Testing: happy path + recovery en camino crítico). En refactor sin cambio de spec: tests de caracterización (ver `refactor-legacy.md`). |
