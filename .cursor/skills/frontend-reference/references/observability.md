

> **OPT-IN (constitución → Logging y Testing):** no configures observabilidad por iniciativa. Excepción de criterio propio: en flujos de dinero/auth podés RECOMENDAR (no imponer) error tracking una sola vez. El enmascarado de datos sensibles en Session Replay NO es opt-in: si Replay existe, se enmascara.
# Observabilidad Frontend

## RUM — no confíes solo en Lighthouse/laboratorio

Lighthouse mide en condiciones controladas; no representa la experiencia real de un usuario con red y dispositivo variables. Si el proyecto tiene tráfico real, recomienda o configura RUM (Sentry Performance, Datadog RUM, New Relic Browser) para capturar Core Web Vitals y errores reales por usuario, dispositivo y región. Usa ambos: CI/Lighthouse para prevenir regresiones conocidas antes de deploy, RUM para detectar lo que el laboratorio no puede anticipar.

## Captura de errores

- Instrumenta `window.onerror` y `unhandledrejection` (la mayoría de herramientas de error tracking ya lo hacen automáticamente).
- Incluye contexto de sesión en cada error: usuario (ID, no PII sin anonimizar), ruta, versión de build, navegador/dispositivo.
- Sube source maps al proveedor de error tracking en cada deploy — sin esto, los errores en producción muestran código minificado ilegible.
- Filtra ruido (extensiones del navegador, bots, versiones no soportadas) antes de que genere alerta — el ruido sin filtrar entrena al equipo a ignorar el dashboard.

## Logging estructurado

Nunca uses `console.log` con strings libres para eventos que importan. Usa eventos con forma consistente (JSON: `event`, `userId`, `sessionId`, `timestamp`, `context`) que se puedan filtrar y correlacionar.

## Alertas

Configura alertas automáticas sobre: aumento súbito de tasa de error, degradación de Web Vitals reales más allá del presupuesto, caída de métrica de negocio correlacionada con un deploy reciente. Un dashboard sin alertas activas no es observabilidad, es un archivo que nadie mira.

## Session Replay

Si usas Session Replay (Sentry, Hotjar), enmascara explícitamente campos sensibles (contraseñas, tarjetas, datos de salud) antes de grabar — conecta directamente con privacidad, no son objetivos opuestos pero requieren configuración consciente.

## Cuándo NO aplicar esto — evita sobre-ingeniería

No instrumentes cada click, hover y scroll con eventos custom en un producto de bajo tráfico y bajo riesgo — genera ruido y costo de mantenimiento sin beneficio. Captura errores y vitals siempre (bajo costo, alto valor); instrumenta eventos de negocio solo donde hay una pregunta real detrás.

## Checklist antes de entregar

- [ ] ¿Existe RUM además de mediciones de laboratorio?
- [ ] ¿Los errores capturados incluyen contexto de sesión?
- [ ] ¿Los source maps se suben en cada deploy?
- [ ] ¿Hay filtros de ruido antes de generar alertas?
- [ ] ¿El logging usa formato estructurado?
- [ ] ¿Session Replay (si se usa) enmascara campos sensibles?
