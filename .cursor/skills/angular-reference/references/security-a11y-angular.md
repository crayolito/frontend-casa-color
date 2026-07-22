# Referencia: Seguridad, A11y e i18n — SOLO deltas de Angular

> El CRITERIO base vive en `frontend-reference/references/security.md` y `accessibility.md` y NO es opt-in (constitución). Acá solo lo específico de Angular. No dupliques: si buscás el porqué, está allá.

## Seguridad — deltas Angular

- El sanitizador de Angular ES la defensa XSS: interpolación y property binding sanitizan solos. **`bypassSecurityTrust*` prohibido sin revisión de seguridad documentada** — no se apaga el sanitizador por comodidad.
- CSP estricta + Trusted Types en producción (Angular los soporta; activarlos es config, no heroísmo).
- Tokens/sesión: el flujo completo y el trade-off documentado en ADR está en `auth-session.md`.
- Dependencias: Renovate/Dependabot activo + `npm audit` en CI (constitución → señal supply chain). Una dependencia abandonada con acceso al DOM es superficie de ataque.

## A11y — deltas Angular

- A11y es criterio de DONE, no fase final (constitución → baseline AA siempre activa).
- Herramienta concreta: **CDK a11y** — `FocusTrap`/`cdkTrapFocus` en modales, `LiveAnnouncer` para cambios dinámicos, `FocusMonitor` para foco visible. No reescribir eso a mano.
- Reglas de a11y de templates de angular-eslint ACTIVADAS como error.
- Routing SPA: foco gestionado en cada navegación (el criterio está en accessibility.md genérico; en Angular se resuelve en un servicio que escucha el Router).

## i18n — decisión de día 1

- Se decide el día 1 aunque haya un solo idioma: retrofitear i18n a los 2 años es de lo más caro que existe. La decisión va en ADR.
- Opciones: `@angular/localize` (builds por locale, más performance) vs Transloco (runtime, más flexible). Elegir según necesidad real de cambiar idioma en vivo.
- Fechas, números, monedas: SIEMPRE pipes de Angular / `Intl` con locale — jamás formateo manual con strings.
