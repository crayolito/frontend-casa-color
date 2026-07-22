
# Resiliencia y Manejo de Errores

## Error Boundaries — por sección, no solo global

Coloca Error Boundaries (React) / `errorCaptured` (Vue) / `ErrorHandler` (Angular) a nivel de sección funcional, no solo uno global en la raíz. Un fallo en un widget secundario nunca debe tumbar un flujo crítico que corre en paralelo (ej. checkout). Cada sección independiente necesita su propio límite de contención con fallback específico a su contexto.

## Categorías de error — trátalas distinto, nunca con un catch genérico

| Tipo | Manejo |
|---|---|
| Red (timeout, sin conexión) | Recuperable con reintento; feedback claro de "sin conexión" |
| HTTP 4xx | No reintentar automáticamente — la petición estaba mal formada, requiere feedback específico |
| HTTP 5xx | Candidato a reintento con backoff — puede ser transitorio |
| Render/JS no capturado | Error Boundary + reporte a observabilidad |
| Validación | No es un "error" técnico — es estado normal de UI |

## Retry con backoff

Si implementas reintentos automáticos, usa backoff exponencial con jitter y límite máximo. Nunca reintentes un 4xx automáticamente (fallará igual). Nunca reintentes sin límite — puede agravar un servidor ya sobrecargado (thundering herd).

## Fallback UI

- Sección secundaria: ocultar silenciosamente o estado vacío.
- Sección crítica (checkout, pago): mensaje claro con acción concreta (reintentar, contactar soporte) — nunca fallar en silencio.

## Prevención de doble submit

Deshabilita el control (botón) inmediatamente al iniciar una acción — no solo muestres un spinner encima de un botón que sigue siendo clicable. Combina con debounce en búsqueda/autocompletado.

## Cuándo NO aplicar esto — evita sobre-ingeniería

No implementes retry con backoff exponencial, circuit breakers, y fallback granular en cada llamada de red de un proyecto pequeño de bajo tráfico y bajo riesgo. Reserva la resiliencia robusta para flujos críticos (pagos, autenticación); mantén manejo simple (mostrar error, reintentar manual) en secciones de bajo impacto.

## Checklist antes de entregar

- [ ] ¿Hay Error Boundaries por sección funcional, no solo uno global?
- [ ] ¿Se distingue el manejo de errores de red, 4xx, 5xx y render?
- [ ] ¿Los reintentos automáticos usan backoff con límite y solo aplican a errores transitorios?
- [ ] ¿El fallback UI varía según criticidad de la sección?
- [ ] ¿Los botones se deshabilitan durante la petición para evitar doble submit?
