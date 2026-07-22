# Referencia: Seguridad

> Ejemplos agnósticos. Traducí al stack del proyecto.
> Mapeado a OWASP Top 10 2025 (final, publicado enero 2026) + OWASP API Security Top 10 2023.
> TODA la seguridad es obligatoria; ninguna espera pedido. La regla vive en `constitution.mdc`; acá va el detalle.

## Dos niveles (ambos obligatorios — la diferencia es CUÁNDO)

- **Base** → siempre activa, en todo proyecto. Omitirla = exploit directo.
- **Situacional** → se activa automáticamente cuando el sistema tiene la SEÑAL. El agente la detecta; el dev no la pide. Sin señal, no se aplica (control sin vector = código muerto).

---

## Base — siempre activa

### Validación y sanitización de input (A05)
```
# MAL — confiar en el input del cliente
function createUser(body):
    repository.save(body)            # entra cualquier cosa

# BIEN — validar en el borde, fail fast
function createUser(body):
    data = schema.validate(body)     # rechaza lo mal formado (400/422)
    repository.save(data)
```

### Queries parametrizadas (A05)
```
# MAL — concatenación = inyección SQL
query("SELECT * FROM users WHERE email = '" + email + "'")

# BIEN — parámetros preparados, siempre
query("SELECT * FROM users WHERE email = ?", [email])
```

### Autorización a nivel de objeto — IDOR/BOLA (A01 / API1, el #1 explotado)
```
# MAL — chequea el ROL, no la PROPIEDAD del recurso
function getOrder(userId, orderId):
    if user.role == "customer":
        return repository.find(orderId)   # ¡puede leer la orden de CUALQUIERA!

# BIEN — el recurso pedido pertenece a quien lo pide
function getOrder(userId, orderId):
    order = repository.find(orderId)
    if order.ownerId != userId:
        throw NotAuthorized(orderId)      # 403; evaluar 404 si revelar existencia filtra info
    return order
```
> Regla mental: "¿este usuario puede tocar ESTE recurso concreto?" — no solo "¿tiene el rol?".
> Test obligatorio: userB pide recurso de userA → 403.

### Autorización a nivel de función — BFLA (A01 / API5)
```
# MAL — solo verifica autenticación
route DELETE /admin/products/:id  -> [authenticate] -> deleteProduct

# BIEN — verifica autenticación Y rol, con middleware centralizado
requireRole(role) = (req) ->
    if !req.user: throw 401
    if req.user.role != role: throw 403

route DELETE /admin/products/:id  -> [authenticate, requireRole("admin")] -> deleteProduct
```
> El rol se lee de la base de datos, nunca del cliente. Agrupar rutas privilegiadas bajo el middleware.
> Test obligatorio: usuario común llama endpoint admin → 403; sin token → 401.

### Valores críticos del servidor + allowlist de campos (API3)
```
# MAL — mass assignment: el body entero al ORM
update(userId, req.body)                 # el usuario se auto-asigna role: "admin"

# BIEN — solo los campos permitidos
{ name, email } = req.body
update(userId, { name, email })

# MAL — el precio viene del cliente
{ productId, quantity, price } = req.body
createOrder({ total: price * quantity })

# BIEN — el servidor calcula con SUS datos
{ productId, quantity } = req.body
product = repository.find(productId)
createOrder({ total: product.price * quantity })

# MAL — devolver el objeto completo de la DB
return user                              # incluye passwordHash, flags internos

# BIEN — seleccionar solo lo necesario
return select(user, [id, name, email, createdAt])
```
> Test obligatorio: mandar `role`/`price` en el body → el campo se ignora; el response nunca trae hashes ni internos.

### Flujos críticos: atómicos, sin TOCTOU (API6 + Unit of Work de la constitución)
```
# MAL — leer y después escribir (dos requests simultáneos pasan ambos)
if product.stock >= qty:                 # check
    decrement(product, qty)             # act — carrera entre check y act

# BIEN — verificar y actuar en la MISMA operación atómica
UPDATE products SET stock = stock - :qty
WHERE id = :id AND stock >= :qty
# filas afectadas == 0 → sin stock, rechazar. Cupones: mismo patrón (marcar usado atómicamente).
```

### Contraseñas y secretos (A04 / A07 / A02)
```
# MAL                                   # BIEN
password guardada en texto plano        hash adaptativo: bcrypt (costo ≥12) o argon2
hash con MD5 / SHA1                     bcrypt / argon2 (lentos a propósito)
const KEY = "sk_live_abc123"            const KEY = env("STRIPE_KEY")  # y verificar al boot que existe
logger.info("login", { password })      logger.info("login", { userId })   # nunca secretos
```
> Política de contraseñas: longitud mínima (12+) y chequeo contra listas filtradas.
> NO reglas de composición arbitrarias ("una mayúscula y un número") — criterio NIST/OWASP moderno.

### Sin endpoints de prueba en producción (A02 / API9)
```
# Los endpoints de seed/debug/test viven detrás de guard de entorno o no existen:
if env != "production":
    route POST /seed, GET /debug/users
# Checklist pre-deploy: grep de rutas; probar /seed, /debug, /test, /v0 → todas 404.
```

### Logging de eventos de seguridad — SIEMPRE (A09, NO opt-in)
```
# Estos eventos se loguean exista o no pedido de logging general:
logger.security("auth.failed",      { userId, ip })           # login fallido
logger.security("authz.denied",     { userId, resource, ip }) # fallo de autorización
logger.security("perm.changed",     { actor, target, role })  # cambio de permisos
logger.security("admin.action",     { adminId, action, targetId })
# Siempre: quién, qué, cuándo, desde dónde. Nunca: el secreto/credencial.
```

---

## Situacional — obligatoria al detectar la señal

| Señal del sistema | Control disparado | Qué hacer (resumen) |
|---|---|---|
| API pública o endpoint de auth | Rate limiting / anti-brute-force | Límite por IP/usuario; en auth, backoff tras N fallos. **Nunca lockout duro solo por email** (un atacante bloquea a la víctima a voluntad). 429 + `Retry-After`. |
| Sesiones basadas en cookies | Protección CSRF | Token anti-CSRF o `SameSite`. (Solo Bearer token en header → no aplica.) |
| Auth con tokens (JWT) *(API2)* | Higiene de token | `expiresIn` corto y explícito; verificación con `algorithms` fijo (rechaza `none`); invalidar al logout (denylist/versionado si el token es stateless). |
| Backend hace fetch a URLs del usuario *(API7 → dentro de A01 en 2025)* | Protección SSRF | Parsear la URL; solo HTTPS; allowlist de dominios; bloquear localhost, rangos privados y metadata cloud (169.254.169.254). |
| Subida de archivos | Validación de archivos | Tipo por contenido (no solo extensión), tamaño máximo, almacenar fuera del webroot, nunca ejecutar/servir como código. |
| API consumida por navegador | CORS + headers | CORS con allowlist de orígenes por entorno; headers de seguridad (helmet o equivalente). |
| Se consumen APIs de terceros *(API10)* | Validar la respuesta | Verificar estado esperado (`succeeded`, no `pending`) y que los montos coinciden con lo propio antes de actuar. |
| Pipeline de dependencias *(A03)* | Supply chain / SBOM | Lockfile fijo (`npm ci`, no `npm install` en deploy); escaneo en CI; deploy bloqueado con vulnerabilidades críticas/altas. |

```
# Rate limit excedido
HTTP 429 Too Many Requests
Header: Retry-After: 30
{ "error": { "code": "RATE_LIMITED", "message": "Demasiados intentos" } }
```

> No metas estos controles sin la señal. CSRF en una API stateless con Bearer token, o rate limiting
> en un servicio interno sin exposición, es ruido (anti-sobreingeniería, constitución).

---

## Reglas clave
- TODA la seguridad es obligatoria. Base = siempre. Situacional = automática con la señal. Nada espera pedido: si esperás un pedido, ya perdiste.
- Situacional ≠ opcional: lo dispara una propiedad del sistema, no la memoria del dev.
- El logging de seguridad y los tests de seguridad son las DOS excepciones no-opt-in de logging/testing.
- "OWASP" no es una capa que se agrega. Es una lista de riesgos que se previenen en varias capas.
- El frontend oculta; el backend decide. Autenticación ≠ autorización.

## Verificación (lo que sdd-verify chequea duro — con test ejecutable, no solo lectura)
- [ ] **IDOR/BOLA**: test userB→recurso de userA = 403; ningún endpoint devuelve recursos sin verificar propiedad *(A01/API1)*
- [ ] **BFLA**: test usuario común→endpoint privilegiado = 403; sin token = 401 *(A01/API5)*
- [ ] **Mass assignment / valores críticos**: test con `role`/`price`/campo prohibido en el body → ignorado; el total usa el precio del servidor *(API3)*
- [ ] **Injection**: todo input validado; cero queries por concatenación *(A05)*
- [ ] **Flujos críticos atómicos**: verificación y mutación en una sola operación; sin patrón leer-luego-escribir *(API6)*
- [ ] **Secretos**: cero credenciales hardcodeadas; cero secretos en logs; variables críticas verificadas al boot *(A02/A04)*
- [ ] **Respuestas**: sin stack traces al cliente; sin campos internos (hashes, flags) en responses *(A10/API3)*
- [ ] **Eventos de seguridad logueados**: login fallido, authz denegada, cambio de permisos, acciones admin *(A09)*
- [ ] **Endpoints de prueba**: ninguno activo en producción *(API9)*
- [ ] **Situacionales**: cada señal presente tiene su control (JWT→expiración/algoritmo, fetch de URLs→SSRF, uploads→validación, navegador→CORS/headers, terceros→validación de respuesta, deps→lockfile+scan, API pública→rate limit, cookies→CSRF)
