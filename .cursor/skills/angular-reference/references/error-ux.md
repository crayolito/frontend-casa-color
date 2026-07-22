# Referencia: Errores de cara al usuario — qué se muestra y cuándo

> `data-http.md` define `AppError` normalizado. Esto define el CRITERIO de qué ve el usuario, para que no lo invente cada dev. Sin esto, un proyecto termina con 4 estilos de toast y errores tragados.

## Tabla de decisión por tipo de error

| Situación | Qué ve el usuario | Cómo |
|---|---|---|
| Error de validación de campo (`400` con detalle) | Mensaje pegado AL CAMPO | El form mapea `error.code` → mensaje del catálogo; nunca el texto crudo del server |
| Error de negocio esperado (`error.code` conocido: sin stock, cupón vencido) | Mensaje inline en el flujo, accionable | Catálogo central `code → mensaje` en `shared/util`; el componente muestra, no traduce |
| Fallo transitorio en una ACCIÓN del usuario (submit, guardar) | Toast/snackbar + el form conserva lo escrito + botón rehabilitado para reintentar | Estado de submit con signals; NUNCA perder input del usuario |
| Fallo cargando datos de una SECCIÓN | Estado de error local de la sección con botón "Reintentar" | `httpResource` expone error → template `@if (resource.error())`; el resto de la página vive |
| Fallo cargando datos CRÍTICOS de la vista entera | Página/panel de error de la ruta | Componente de error reusable; no una vista en blanco |
| `401` | Nada visible: refresh silencioso o redirect a login con returnUrl | `auth-session.md` |
| `403` | "No tenés permiso para esto" — honesto, sin detalles internos | Nunca fingir que "algo salió mal": es autorización, decirlo |
| `404` de recurso | Vista de "no existe" con salida (volver al listado) | Ruta wildcard + manejo en resolver/guard |
| `5xx` / red caída | Mensaje genérico + reintento; si es GET idempotente, retry automático con backoff ANTES de molestar | Interceptor (retry) + fallback UI |
| Error inesperado (bug) | Mensaje genérico "algo salió mal" + se REPORTA solo | `ErrorHandler` global → tracking; el usuario jamás ve stack ni internos (constitución) |

## Reglas duras

- Todo `catchError` que devuelve `EMPTY`/valor default SIN reportar ni mostrar nada = error tragado = prohibido. O lo ve el usuario, o lo ve el tracking, o ambos — nunca nadie.
- Retry automático SOLO en GET idempotente. Acciones del usuario reintenta EL USUARIO (o idempotency key mediante — constitución).
- Los mensajes salen del catálogo central, no strings sueltos en componentes: un cambio de tono/idioma no puede significar tocar 40 archivos.
