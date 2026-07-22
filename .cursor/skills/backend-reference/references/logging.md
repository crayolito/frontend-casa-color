# Referencia: Logging, trazabilidad y auditoría

> Ejemplos agnósticos — traducí al stack del proyecto. Tiene niveles: mirá "Cuándo aplicar cada nivel" ANTES de implementar. No apliques todo a un CRUD simple.

Contenido: [Tres tipos](#tres-tipos) · [Filtro de ruido](#filtro) · [Correlation ID](#correlation) · [Dispositivo](#device) · [Application log y regla del body](#application) · [User flow](#userflow) · [CUJ y payload crudo](#cuj) · [Audit](#audit) · [Alertas](#alertas) · [Retención](#retencion) · [Niveles](#niveles) · [Checklist](#checklist)

## <a name="tres-tipos"></a>Tres tipos de registro — streams separados, nunca mezclados

| Tipo | Responde | Audiencia |
|---|---|---|
| **Application log** | ¿Qué hizo el sistema por dentro? (queries lentas, stack traces) | Dev |
| **Audit log** | ¿Qué hizo el usuario al sistema? (canceló orden 456 desde IP x) | Soporte / Negocio |
| **Trace (correlationId)** | ¿Por dónde pasó el proceso y dónde se rompió? | Dev / Soporte |

## <a name="filtro"></a>Pieza 0: Filtro de ruido — antes de cualquier log

```
NOISE_PATHS = ["/health","/ping","/metrics","/favicon.ico","/_next/static","/assets/","/public/"]
NOISE_USER_AGENTS = ["kube-probe","GoogleHC","ELB-HealthChecker"]
shouldLog(req) = !NOISE_PATHS.match(req.path) && !NOISE_UA.match(req.userAgent)
```

Regla: si el request no tiene impacto en estado ni en experiencia del usuario, no se loguea. SÍ siempre: errores, acciones de usuario, cambios de estado, operaciones lentas.

**Observabilidad ≠ analytics.** "¿Falló algo?" → log user_flow. "¿Cómo se comportan?" (browseo, filtros de catálogo) → Posthog/Mixpanel/GA, NUNCA los logs. Criterio para GETs en user_flow: ¿el resultado marca un punto de quiebre en un flujo con consecuencias? Sí: `/dashboard` post-login, `/orders`, `/checkout/status`, `/admin/*`, generación de reportes. No: `/productos`, categorías, filtros públicos (analytics).

## <a name="correlation"></a>Pieza 1: Correlation ID

```
correlationId = parseTraceparent(req.headers["traceparent"])?.traceId   # W3C, si upstream lo manda
             or req.headers["x-correlation-id"]                          # aceptar el entrante SIEMPRE
             or generateUUID()                                           # generar solo como fallback
context.set("correlationId", correlationId)
context.set("requestId", generateUUID())        # único de ESTE request; un proceso tiene varios
res.headers["x-correlation-id"] = correlationId
```

- Generar uno nuevo cuando ya venía uno **rompe la traza** — aceptar preserva la traza entre servicios.
- `correlationId` = hilo del proceso completo; `requestId` = una llamada individual. No los confundas.
- Monolito/pocos servicios: `x-correlation-id` alcanza. Aceptar `traceparent` desde el día uno hace gratis la migración a OpenTelemetry.

## <a name="device"></a>Pieza 1.5: Contexto de dispositivo

Parsear el user-agent **una vez en el middleware** (ua-parser-js o equivalente) → atributos planos: `deviceType` (mobile|desktop|tablet|bot|unknown), `os`, `osVersion`, `browser`. Reglas:

- Va en todo user_flow y audit, y en application ERROR/WARN (en INFO técnico, opcional). **Solo en atributos, nunca en el body.**
- Guardar el `userAgent` crudo además de los derivados (derivados para filtrar; crudo para lo que el parser clasificó mal).
- App nativa: header propio `x-client: app-android/2.4.1` — más confiable que adivinar por UA y correlaciona bugs con releases.
- `deviceType="bot"` que no sea health check conocido → filtro de ruido o evento de seguridad, según el path.

Uso real: `flow=checkout result=failed deviceType=mobile` → en segundos sabés si el bug es solo móvil.

## <a name="application"></a>Pieza 2: Application log

JSON estructurado; detalle filtrable en **atributos**; cada línea con `correlationId`. Ejemplo canónico (los otros tipos varían `logType` y agregan sus campos — ver cada pieza):

```json
{
  "timestamp": "2026-05-31T14:30:00.123Z", "level": "ERROR",
  "service": "orders-api", "module": "payment", "logType": "application",
  "flow": "checkout", "provider": "stripe", "step": "charge_card",
  "correlationId": "corr-abc-123", "requestId": "req-xyz-789",
  "userId": 123, "userName": "Juan Pérez", "clientIp": "198.51.100.24",
  "httpMethod": "POST", "httpPath": "/api/checkout/payment", "httpStatus": 500, "durationMs": 30000,
  "message": "Checkout: fallo al cobrar con tarjeta · 198.51.100.24",
  "orderId": 456, "attempt": 2,
  "error": { "type": "GatewayTimeout", "stack": "..." }
}
```

### Regla del body (message) — titular, no dump

El body es lo primero que se lee en cualquier viewer. Formato por capa:

| Capa | Body | Detalle (en atributos) |
|---|---|---|
| Application | `{Origen}: {acción humana} · {IP}` | HTTP, módulo, duración, IDs técnicos |
| User flow | `{Origen}: {acción} · {email} · {IP}` | orderNumber, paymentMethod, result, step |
| Audit | `{Origen}: {acción} · {email} · {IP}` | 5W completas |

```
✅ "Checkout: cliente consultando si pagó el QR · 203.0.113.9"
❌ "VeriPagos · HTTP 200 · movimiento 885178 · 258 bytes"      # dump técnico
❌ "GET /api/checkout/status 200 45ms | María | ip ..."         # métricas mezcladas
```

- **NUNCA en el body:** UUIDs, user-agent, totales, números de orden, HTTP status, métricas — todo eso va en atributos.
- La IP va al final del body (filtro rápido por texto) Y como atributo `clientIp` (duplicado intencional). Sin IP disponible (webhook, cron): omitir, no inventar.
- **Atributos planos siempre, sin objetos anidados** en audit/user_flow: los planos filtran en cualquier backend (SigNoz, Datadog, Loki, CloudWatch); los anidados dependen del viewer.
- **Atributos HTTP obligatorios en todo audit y user_flow:** `httpMethod`, `httpPath` (sin query string), `httpStatus`, `durationMs` — sin esto soporte ve qué pasó pero el dev no sabe desde dónde.

### Campos de origen para filtrar sin leer el body

`logType` (capa) · `flow` (checkout, webhook) · `provider` (stripe, veripagos) · `integration` (sub-sistema) · `step` (paso del flujo) · `operation` / `event` (fino, debug).

### Mapeo OpenTelemetry semconv (vive en el serializador del logger, no se renombra a mano)

`httpMethod`→`http.request.method` · `httpPath`→`url.path` · `httpStatus`→`http.response.status_code` · `clientIp`→`client.address` · `userAgent`→`user_agent.original` · `actorUserId`→`user.id` · `correlationId`→`trace_id` · `durationMs`→`http.server.request.duration` (segundos en OTel). Un solo vocabulario interno + una capa de traducción en el exporter — nunca dos vocabularios mezclados en el código.

### Recorrido, resiliencia y sampling

- Loguear cada `step` con el mismo `correlationId` → el punto de ruptura queda visible (validó OK → falló al cobrar).
- **El logger nunca derriba el proceso principal:** try/catch alrededor del log; si Sentry/Logtail se cae, la orden se procesa igual. El log es observabilidad, no lógica de negocio.
- **Sampling solo bajo carga alta real** (miles req/min), nunca desde el día uno: ERROR/WARN 100% siempre, lentos (>2s) siempre, paths críticos siempre, INFO normal ~10%.

## <a name="userflow"></a>Pieza 3: Flujo de cliente legible (user_flow)

Trazabilidad de acciones del usuario que soporte lee sin saber programar:

```
[Juan Pérez] 14:33 → Aplicó cupón "PROMO10" → válido, -15%
[Juan Pérez] 14:34 → Intentó pagar con Stripe → FALLÓ (timeout 30s)
```

Se construye con el JSON canónico + `logType: "user_flow"`, `actorUserId`, `actorName`, `actorEmail`, `event` (PAYMENT_ATTEMPTED), `result` (failed), `reason`, `attempt`, y contexto de dispositivo.

- **Regla del nombre legible:** incluir SIEMPRE `actorName` además del ID — el ID para queries, el nombre para leer sin JOINs mentales. No es redundancia, es usabilidad.
- **Capturar:** entrada a flujos críticos (checkout, onboarding, cancelación), decisiones del usuario, GETs de punto de quiebre, resultado de cada paso, punto exacto de ruptura.
- **NO capturar:** browseo libre, clicks de navegación, filtros públicos → analytics.

## <a name="cuj"></a>Pieza 4: Flujos críticos (CUJ) — snapshot y payload crudo

En pago/cobro/reembolso, cancelación, webhooks de terceros, cambio de permisos/roles, onboarding: el dev necesita ver qué se mandó y qué respondió. Agregar `requestSnapshot`/`responseSnapshot` con campos elegidos:

```
✅ IDs de negocio, estados, método de pago, códigos de error del proveedor, httpMethod/Path/Status/durationMs
❌ NUNCA: tokens, passwords, tarjeta/CVV, API keys, bodies completos (truncar), PII innecesaria
```

No aplica a GETs de consulta aunque sean críticos — ahí alcanza `httpStatus` + `durationMs`.

### Payload crudo — tres niveles (el crudo se justifica solo cuando el dato es IRREPRODUCIBLE)

| Caso | Qué guardar | Dónde | Retención |
|---|---|---|---|
| Request interno de usuario | Snapshot por **allowlist** (blocklist siempre olvida un campo nuevo) — lo generaste vos, se reconstruye desde IDs | user_flow | la del user_flow |
| Llamada saliente a proveedor (Stripe, VeriPagos) | Crudo **redactado** (`redactKeys([card,cvv,token,apiKey,password])`) + truncado (~4000 chars), `logType: provider_exchange` — es tu evidencia si disputás un cobro | Application log | 30–90 días |
| Webhook entrante | Crudo **completo** en tabla propia `webhook_events` (id, provider, receivedAt, rawBody, signature, processedAt, status), persistido **ANTES de procesar** — si el parser falla, es lo único que permite reprocesar | Tabla dedicada | 30–90 días, acceso restringido |

## <a name="audit"></a>Pieza 5: Audit log

Stream separado, append-only. Body: `Pedidos: creados · maria.lopez@example.com · 203.0.113.45`. Las **5W van en atributos planos**, no en el body ni anidadas:

- **Who:** `actorUserId`, `actorName`, `actorEmail`, `clientIp`, `userAgent` · **What:** `event` (ORDER_CREATED), `result`, `targetType`, `targetId` · **When:** ISO 8601 UTC · **Where:** `httpMethod`, `httpPath`, `httpStatus`, `durationMs` · **What changed:** valor anterior/nuevo (cambios) o snapshot (creaciones). Más los de negocio: `orderNumber`, `orderIds`, `grandTotal`, `paymentMethod`, `flow`, `module`, `correlationId`.
- **Qué auditar (no todo):** login/logout/intentos fallidos/cambio de contraseña, cambios de permisos/roles, CRUD de datos críticos (órdenes, pagos, personales), accesos a recursos sensibles. NO: cada GET, navegación, operaciones internas sin impacto.

### Integridad — un audit log editable es decoración

1. **Mínimo si hay usuarios reales:** append-only en BD (`REVOKE UPDATE, DELETE ON audit_logs FROM app_user`).
2. Hash encadenado entre registros (editar uno invalida los siguientes).
3. Servicio externo de escritura (la app escribe, no puede leer ni borrar) — para compliance regulatorio.

### PII

Email/IP/nombre son PII justificada por compliance, pero exige: retención limitada, acceso por rol, enmascarar donde sea posible, y NUNCA contraseñas/tokens/tarjetas/documentos completos. Tradeoff asumido del body con email: prioriza lectura rápida de soporte; si el proyecto entra a mercado con derecho al olvido estricto, el body pasa a `j***@ejemplo.com` con un cambio de una línea en el formatter (los atributos no se tocan).

### El puente

Soporte busca en user_flow por `actorEmail` → obtiene `correlationId` → confirma en audit → el dev busca ese ID en application log y ve endpoint, paso y stack exactos. Diagnóstico en minutos sin acceso cruzado.

## <a name="alertas"></a>Alertas — el log pasivo es decoración

Definir la alerta al mismo tiempo que el log: `error_rate > 5% / 5min` · `failed_logins > 10/usuario/5min` (bloqueo+alerta) y `> 100 globales/min` (seguridad) · `p95 de operación crítica > umbral` · **heartbeat**: ausencia de evento esperado en horario pico (ej. sin ORDER_CREATED en 30 min) = pipeline roto.

## <a name="retencion"></a>Retención diferenciada — nunca una regla única

| Tipo | Retención | Por qué |
|---|---|---|
| Application DEBUG/INFO | 7–14 días | Diagnóstico inmediato |
| Application ERROR/WARN | 30–90 días | Patrones, bugs recurrentes |
| User flow | 30–60 días | Contexto reciente de soporte |
| Audit | 1–7 años | E-commerce 1–2 años mín.; financiero/salud regulado |
| Eventos de seguridad | 1 año mínimo | Investigación de incidentes |

## <a name="niveles"></a>Cuándo aplicar cada nivel (anti-sobreingeniería)

| Nivel | Aplicar cuando... | NO cuando... |
|---|---|---|
| Logs estructurados + niveles + filtro de ruido | Siempre, día uno | — |
| Correlation ID | Varios módulos o proceso cruza capas | Script suelto, CRUD trivial |
| User flow legible | Usuarios reales con acciones con consecuencias | Prototipo sin usuarios |
| CUJ snapshots | Pago, cancelación, webhooks | GETs de consulta, CRUD simple |
| Audit separado | Datos sensibles, usuarios reales, compliance | MVP sin usuarios reales |
| Alertas activas | Usuarios reales afectados por fallos | Entorno de desarrollo |
| Sampling | Miles de req/min reales | Volumen bajo (loguear todo es correcto) |
| OpenTelemetry distribuido | Múltiples servicios reales | Monolito (correlationId alcanza) |

**Regla de oro:** arrancá con estructurado + filtro + correlationId. User flow y audit cuando manejes datos que importan. CUJ solo donde el fallo duele. No saltes a OTel en un monolito de 3 endpoints.

**Herramientas (no reinventar):** errores → Sentry (mínimo con usuarios). Logs+búsqueda → Logtail/BetterStack (ligero) o Datadog/SigNoz (completo). Analytics → Posthog/Mixpanel/GA. Audit inmutable → BD separada restringida. Trazas → OpenTelemetry + Jaeger/Zipkin.

**Transversales:** timestamps ISO 8601 UTC sin excepción · nombres de campo consistentes en TODO el sistema (`correlationId`, no `corr_id` acá y `traceId` allá) · DEBUG nunca en producción.

## <a name="checklist"></a>Verificación

- [ ] Middleware filtra ruido (health checks, assets, bots) antes de loguear
- [ ] User-agent parseado a `deviceType/os/browser` planos; crudo guardado aparte
- [ ] Payloads crudos solo cuando son irreproducibles (proveedores redactados por allowlist; webhooks en tabla propia ANTES de procesar)
- [ ] Browseo libre va a analytics, no a observabilidad
- [ ] Cada log con `correlationId` (entrante aceptado, no regenerado) y timestamp ISO 8601 UTC
- [ ] Todo audit y user_flow con `httpMethod/httpPath/httpStatus/durationMs` y `actorName` además del ID
- [ ] Atributos planos — sin objetos anidados en audit/user_flow
- [ ] Body = titular corto; IDs, métricas y status en atributos
- [ ] CUJ con snapshot parcial sin datos sensibles
- [ ] Audit y application en streams separados; audit append-only o con integridad
- [ ] 5W en atributos planos; PII con retención limitada y acceso restringido
- [ ] Logger con try/catch — nunca derriba el proceso principal
- [ ] Retención diferenciada por tipo
- [ ] Alertas definidas para errores críticos, seguridad y heartbeat
