# Referencia: Capa de datos (data/)

- **Mappers obligatorios en la frontera.** El DTO crudo de la API NUNCA sale de `data/`: se mapea a modelo propio de la feature. Cuando el backend cambie el contrato — cambiará — se toca un archivo, no cuarenta.
- DTOs por codegen si hay OpenAPI/Swagger (`openapi-typescript`). Tipos a mano contra una API con spec = drift garantizado.
- Interceptors viven en `core/http`: auth token, correlación de requests, errores global, retry con backoff SOLO para GETs idempotentes (constitución → señal situacional: nunca retry de POST de pago sin idempotency key).
- **`AppError` normalizado**: el interceptor mapea `HttpErrorResponse` → `AppError` propio. Los componentes JAMÁS catchean `HttpErrorResponse` crudo. El contrato que se consume es el de la constitución: `{ data } / { error: { code, message } }` — el front no inventa otro.
- Lectura: `httpResource()` como default. Mutaciones: servicios con invalidación explícita del resource afectado.
- Qué ve el usuario ante cada error: `references/error-ux.md`. Flujo de sesión/token: `references/auth-session.md`.
