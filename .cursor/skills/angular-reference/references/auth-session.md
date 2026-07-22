# Referencia: Sesión y autenticación — el flujo COMPLETO

> La biblia original solo nombraba "guards e interceptor de auth". Esto cubre lo que se implementa mal en todo proyecto: el ciclo de vida entero de la sesión. La política de tokens (dónde se guardan, riesgos) es de la constitución y `frontend-reference/references/security.md` — acá va el CÓMO en Angular.

## Dónde vive qué

- `core/auth/session.service.ts`: dueño único del estado de sesión. Expone `Signal<Session | null>` readonly + `isAuthenticated: computed`. Nadie más guarda copia del usuario.
- `core/auth/auth.interceptor.ts`: adjunta el token a requests salientes (solo a la API propia — allowlist de base URL, nunca a terceros).
- `core/auth/auth.guard.ts`: `CanActivateFn` funcional que consulta el session service.

## Tokens — preferencia y trade-off

1. **Preferido:** cookies `HttpOnly` + `Secure` + `SameSite` gestionadas por el backend → el front no toca el token, el interceptor solo maneja `withCredentials`.
2. Si el contexto obliga a token en JS: en memoria (signal del service), NUNCA localStorage por default. El riesgo aceptado se documenta en ADR — no existe "seguro por defecto" en localStorage, existe riesgo consciente.

## Refresh token — el baile correcto

- El interceptor detecta `401` → intenta UN refresh → reintenta la request original.
- **Single-flight obligatorio**: si 5 requests fallan a la vez, se dispara UN solo refresh y las 5 esperan el resultado (compartir la promesa/observable del refresh en curso). Cinco refresh paralelos = race condition + sesiones invalidadas.
- Refresh falla → sesión muerta: limpiar estado y redirect a login. No loops: un `401` durante el propio refresh NUNCA dispara otro refresh.

## Expiración y redirect

- Al expirar en medio de navegación: guardar la URL destino (`returnUrl` en query param del login) y volver ahí tras re-login. Perder el contexto del usuario es un bug, no un detalle.
- El guard redirige a login con `returnUrl`; el login post-éxito navega a `returnUrl ?? '/'` — validando que sea ruta interna (nunca redirect abierto a URL externa).

## Logout — limpieza total

- Invalidar en backend (endpoint de logout) + limpiar session service + resetear stores/estado de features con datos del usuario + navegar a público. Un logout que deja datos del usuario anterior en un signal store es fuga de datos entre sesiones — testearlo (constitución → auth = camino crítico).
