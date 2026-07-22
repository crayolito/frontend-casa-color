# Referencia: Manejo de errores

> Ejemplos agnósticos — traducí al stack. Niveles: jerarquía + handler global + RFC 9457 son el piso; retries y circuit breaker solo con integraciones externas reales.

Contenido: [Tres familias](#familias) · [Jerarquía y mapeo HTTP](#jerarquia) · [RFC 9457](#rfc9457) · [Handler global](#handler) · [Infraestructura: timeout/retry/idempotencia/breaker](#infra) · [Negocio como flujo](#negocio) · [Nivel proceso y jobs](#proceso) · [Checklist](#checklist)

## <a name="familias"></a>Tres familias de error, tres tratamientos

| Familia | Qué es | Respuesta | Log |
|---|---|---|---|
| **DomainError** | Regla de negocio esperada ("no se cancela orden entregada") | 4xx con `code` | `WARN` sin stack (`INFO` si es rutina, ej. login fallido aislado) |
| **InfrastructureError** | Falla externa recuperable (BD caída, timeout de Stripe) | Retry → si agota, 502/503/504 | `ERROR` |
| **Bug / inesperado** | Estado que no debería existir | 500 opaco | `ERROR` + stack completo |

Un error de negocio **no es un incidente** — es parte del diseño. Confundirlos genera alertas que despiertan al dev por un 404, o bugs enterrados en ruido.

## <a name="jerarquia"></a>Jerarquía — el status vive en la clase, no en un switch

```
class DomainError extends Error:
    code: string          # código interno estable — contrato con el cliente
    httpStatus: number    # el error SABE su status

class UserNotFound extends DomainError:              code="USER_NOT_FOUND", httpStatus=404
class CannotCancelDeliveredOrder extends DomainError: code="ORDER_ALREADY_DELIVERED", httpStatus=409
class ValidationError extends DomainError:            code="VALIDATION_FAILED", httpStatus=422,
                                                      errors: [{ field, code, message }]
class InfrastructureError extends Error:
    retryable: boolean    # ¿tiene sentido reintentar?
    provider: string      # "stripe", "postgres"
```

Agregar un error nuevo = una clase nueva, cero cambios en el handler.

### Mapeo DomainError → HTTP status (criterio, no adivinanza)

| Situación | Status |
|---|---|
| Recurso no existe | 404 |
| Request malformado (sintaxis, JSON roto) | 400 |
| Bien formado pero inválido semánticamente (email sin formato, monto negativo) | 422 |
| Conflicto con estado actual (cancelar entregada, email duplicado) | 409 |
| No autenticado | 401 · Autenticado sin permiso | 403 |
| Rate limit | 429 |
| Dependencia externa caída (retries agotados) | 502/504 · Propio sobrecargado/mantenimiento | 503 |
| Bug | 500 |

400 vs 422: 400 = "no entiendo tu request" (sintaxis); 422 = "lo entiendo pero es inválido" (semántica). Elegí un criterio y sé consistente en TODO el API — la consistencia importa más que la elección.

## <a name="rfc9457"></a>Formato de respuesta: RFC 9457 (Problem Details)

Estándar IETF (sucesor de RFC 7807), `Content-Type: application/problem+json`. No inventar formato propio — clientes, gateways y SDKs ya lo parsean.

```json
// HTTP/1.1 409 Conflict
{
  "type": "https://api.ejemplo.com/errors/order-already-delivered",
  "title": "La orden ya fue entregada",
  "status": 409,
  "detail": "La orden VM-2800 fue entregada el 2026-05-30 y no puede cancelarse.",
  "instance": "/api/orders/VM-2800/cancel",
  "code": "ORDER_ALREADY_DELIVERED",
  "correlationId": "corr-abc-123"
}
```

| Campo | Regla |
|---|---|
| `type` | URI estable del TIPO de error; idealmente resuelve a doc; sin docs aún: `about:blank` |
| `title` | Corto, humano, NO cambia entre ocurrencias del mismo tipo |
| `status` | Duplica el HTTP status (útil si un proxy lo reescribe) |
| `detail` | Explica ESTA ocurrencia, legible para usuario final, sin internos |
| `instance` | Path de la ocurrencia |
| `code` (extensión) | Código interno estable — el frontend hace `switch` sobre esto, nunca sobre el texto |
| `correlationId` (extensión) | **Obligatorio.** Puente con los logs: el usuario reporta este ID, soporte tira del hilo |

**Validación (422):** misma estructura + extensión `errors: [{ field, code, message }, ...]`. Devolver TODOS los errores juntos, no de a uno — obligar a corregir campo por campo en N requests es hostil.

## <a name="handler"></a>Manejador global — última línea de defensa

```
function globalErrorHandler(error, req, res):
    correlationId = context.get("correlationId")
    if error is DomainError:
        logger.warn("Domain error", { code, httpStatus, correlationId, httpPath })   # sin stack
        respond(error.httpStatus, problemDetails(error, correlationId))
    else if error is InfrastructureError:      # retries ya agotados antes de llegar acá
        logger.error("Infrastructure error", { provider, message, stack, correlationId })
        respond(504, { title: "Servicio temporalmente no disponible", status: 504,
                       code: "UPSTREAM_UNAVAILABLE", correlationId })
    else:                                       # bug
        logger.error("Unhandled error", { message, stack, correlationId, httpPath, httpMethod })
        respond(500, { title: "Error interno", status: 500, code: "INTERNAL_ERROR", correlationId })
```

Reglas del handler: el cliente **nunca** ve stack traces, mensajes de driver ni paths internos · el log interno **siempre** tiene el error completo + correlationId + contexto HTTP · la respuesta **siempre** lleva `correlationId` (sin él, el reporte del usuario es inservible) · el stack de un 404 es ruido — DomainError va en WARN sin stack.

## <a name="infra"></a>InfrastructureError: qué hacer con él

### Timeout — SIEMPRE, en toda llamada externa, sin excepción

`httpClient.post(url, body, { timeoutMs: 5000 })` — sin timeout explícito el default suele ser infinito o absurdo. Regla: timeout del cliente < timeout de quien te llama a vos (SLA de 10s ⇒ tus llamadas internas no pueden tener 30s).

### Retry con backoff exponencial + jitter

```
function withRetry(fn, maxAttempts = 3):
    for attempt in 1..maxAttempts:
        try: return fn()
        catch error:
            if not isRetryable(error): throw          # 4xx NO se reintenta: dará lo mismo
            if attempt == maxAttempts: throw
            sleep(baseDelay * 2^attempt + random(0, 300))   # jitter: evita estampida

isRetryable = error.isTimeout or error.httpStatus in [429, 502, 503, 504]
# NUNCA retryable: 400, 401, 403, 404, 422
```

### Idempotencia — el prerequisito del retry

**Nunca reintentes un POST con efectos (cobro, creación) sin clave de idempotencia.** El timeout no dice "no pasó" — dice "no sé si pasó"; reintentar a ciegas = cobro duplicado. El cliente genera `Idempotency-Key: operationUUID` UNA vez por operación de negocio y la repite en cada retry. Si tu API expone POSTs críticos, implementá el lado servidor: tabla `idempotency_keys` (key, responseSnapshot, createdAt) — misma key entrante = devolver la respuesta guardada, no re-ejecutar.

### Circuit breaker — solo con integraciones externas reales

Proveedor caído + retries = agotar workers y sumar latencia. El breaker corta rápido:

```
CLOSED → todo pasa; fallas > umbral (ej. 50% en 30s) → OPEN
OPEN   → falla inmediato sin llamar (503 + UPSTREAM_UNAVAILABLE); tras cooldown → HALF_OPEN
HALF_OPEN → 1 request de prueba: OK → CLOSED · falla → OPEN
```

No implementarlo a mano: librería del stack (opossum, resilience4j, Polly). **Cuándo NO:** monolito que solo habla con su propia BD — ahí es sobreingeniería.

## <a name="negocio"></a>Error de negocio como flujo esperado — la regla vive en el dominio

```
# MAL — la regla no existe, se corrompe el estado
order.status = "cancelled"                     # ¿y si ya fue entregada?

# BIEN
class Order:
    function cancel():
        if this.status == "delivered": throw CannotCancelDeliveredOrder(this.id)
        this.status = "cancelled"
```

Fail fast: el input inválido se rechaza en el borde (422 con `errors[]`), no se deja propagar hasta explotar en el repositorio con un error críptico de BD.

## <a name="proceso"></a>Nivel proceso — cuándo SÍ dejar caer el servicio

"El servicio nunca se cae" aplica a errores **dentro de un request** (el handler responde y el proceso sigue). Ante un error **fuera de todo request**, el estado del proceso ya no es confiable — seguir sirviendo con memoria corrupta es peor que reiniciar. Diseño: **crash-only + restart** (el orquestador — K8s, PM2, systemd — levanta el proceso limpio):

```
process.on("uncaughtException", (err) => {
    logger.fatal("Uncaught exception — shutting down", { message, stack })
    server.close(() => process.exit(1))       # graceful: termina requests en vuelo
    setTimeout(() => process.exit(1), 10000)  # a la fuerza si no cierra en 10s
})
process.on("unhandledRejection", (reason) => { throw reason })   # mismo camino
```

### Jobs y background (donde no hay `res`)

Todo job con try/catch propio y `correlationId` generado al inicio · fallo de un ítem no mata el batch (registrar, continuar, resumen al final) · colas: reintentos con backoff los maneja la cola (no `while(true)` a mano) + **dead letter queue** — un mensaje envenenado no puede bloquear la cola para siempre.

**Vocabulario:** los nombres de campo (`correlationId`, etc.) son los mismos de `logging.md`. Un solo vocabulario.

## <a name="checklist"></a>Verificación

- [ ] Errores de negocio como tipos propios con `code` y `httpStatus` en la clase (sin switch gigante)
- [ ] Respuestas de error en `application/problem+json` (RFC 9457), siempre con `correlationId`
- [ ] Validación devuelve todos los errores juntos en `errors[]` (422)
- [ ] Mapeo de status sigue la tabla (409 conflictos de estado, 422 semántica, criterio 400/422 consistente)
- [ ] El cliente nunca ve stack traces/internos; el log interno tiene el error real completo
- [ ] DomainError en WARN sin stack; bugs en ERROR con stack
- [ ] Toda llamada externa con timeout explícito (cliente < quien te llama)
- [ ] Retries con backoff + jitter, solo sobre retryables; nunca 4xx
- [ ] POSTs con efectos usan idempotency key antes de habilitar retry
- [ ] `uncaughtException`/`unhandledRejection` → log fatal + graceful shutdown, no tragar y seguir
- [ ] Jobs/consumers con manejo propio, correlationId y dead letter queue
- [ ] Existe manejador global que responde controlado ante cualquier error de request
