# Referencia: API Design

> Ejemplos agnósticos. Traducí al framework del proyecto.

## Nomenclatura de recursos

```
# BIEN — sustantivos, plural, jerárquico
GET    /users
GET    /users/:id
POST   /users
PUT    /users/:id
PATCH  /users/:id
DELETE /users/:id
GET    /users/:id/orders        # recurso anidado

# MAL — verbos en la URL
POST   /createUser
GET    /getUsers
DELETE /deleteUser/:id
GET    /users/:id/getOrders
```

## Códigos de estado — usar el correcto

```
200  GET/PUT/PATCH exitoso con respuesta
201  POST que creó un recurso
204  DELETE exitoso, sin body
400  Datos mal formados del cliente
401  No autenticado (no sabemos quién sos)
403  Autenticado pero sin permiso
404  Recurso no existe
409  Conflicto (ej: email ya registrado)
422  Datos bien formados pero semánticamente inválidos
500  Error interno no controlado
```

## Estructura de respuesta consistente

```
# Éxito con un recurso
{ "data": { "id": 1, "name": "..." } }

# Éxito con lista paginada
{
  "data": [ ... ],
  "meta": { "page": 1, "perPage": 20, "total": 350 }
}

# Error — SIEMPRE con código interno + mensaje
{
  "error": {
    "code": "EMAIL_ALREADY_EXISTS",
    "message": "Ya existe una cuenta con este email"
  }
}
```

## Reglas clave
- El código HTTP da la categoría. El `code` interno da el problema específico.
- Toda lista se pagina. Nunca devolver una colección completa sin límite.
- **Offset vs cursor — se elige por patrón de UI primero, dataset segundo:** offset (`page`/`perPage`/`total`) cuando el usuario necesita saltar a páginas, URLs compartibles y conteo total (tablas admin, resultados con filtros) y el dataset es acotado/estable. Cursor (token opaco `after`) cuando el dataset es grande o muta seguido (feeds, timelines, alto volumen): rinde mejor a escala y no duplica/saltea ítems al insertar, pero pierde salto a página N y total — la UI pasa a Load More/scroll infinito. La decisión se coordina con frontend (frontend-reference → state-data.md, Componentes de datos); no se cambia después gratis.
- Versionar (`/api/v1/`) solo cuando se rompe un contrato existente, no por cada cambio.
- La misma forma de respuesta en toda la API. Un consumidor no debería adivinar.

---

## Nivel senior — lo que separa una API correcta de una robusta

> Aplicar según el tamaño del sistema. En un CRUD chico, lo de arriba alcanza.

### Listas: filtrado, ordenamiento y búsqueda
```
# Convención consistente por query params
GET /orders?status=pending&sort=-createdAt&page=2&perPage=20
              \_______/      \________/      \____________/
              filtro         orden          paginación
                             (- = descendente)

# La respuesta refleja los filtros aplicados en meta
{ "data": [...], "meta": { "page": 2, "perPage": 20, "total": 350, "filtered": 47 } }
```

### Idempotencia en operaciones de creación
```
# Problema: el cliente reintenta un POST por timeout y crea la orden 2 veces.
# Solución: idempotency key. La misma key = la misma operación, una sola vez.

POST /payments
Header: Idempotency-Key: client-generated-uuid-123

# El servidor: si ya procesó esa key, devuelve el MISMO resultado sin re-ejecutar.
# Crítico en pagos y cualquier operación que no debe duplicarse.
```

### Concurrencia: evitar que dos updates se pisen
```
# Problema: dos personas editan el mismo recurso, el segundo pisa al primero.
# Solución: ETag + If-Match (optimistic locking)

GET /orders/456          → responde con Header: ETag: "v3"
PUT /orders/456          → Header: If-Match: "v3"
   # Si el recurso ya cambió a v4, el servidor responde 412 Precondition Failed.
   # El cliente sabe que su versión está vieja antes de pisar nada.
```

### Rate limiting: comunicar los límites
```
# La API informa el estado del límite en cada respuesta
Header: X-RateLimit-Limit: 100
Header: X-RateLimit-Remaining: 23
Header: X-RateLimit-Reset: 1717171717

# Al excederse → 429 Too Many Requests + Retry-After
```

### Cuándo aplicar cada cosa
| Técnica | Aplicar cuando... |
|---|---|
| Filtrado/orden en listas | Cualquier lista que crezca con el tiempo |
| Idempotency key | Pagos, operaciones que no deben duplicarse |
| ETag / If-Match | Recursos editados por múltiples usuarios a la vez |
| Rate limiting | API pública o con consumidores externos |

No metas idempotency keys ni ETags en un CRUD interno simple. Es ruido si no hay concurrencia ni dinero en juego.

---

## Verificación
- [ ] URLs con sustantivos, no verbos
- [ ] Código HTTP correcto según la operación
- [ ] Respuesta con estructura `{ data }` o `{ error: { code, message } }`
- [ ] Listas paginadas con `meta`
- [ ] Filtrado/orden consistente por query params (si hay listas que crecen)
- [ ] Idempotencia en operaciones críticas que no deben duplicarse
- [ ] Control de concurrencia donde múltiples usuarios editan lo mismo
