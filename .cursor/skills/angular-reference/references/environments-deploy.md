# Referencia: Environments, build y deploy

> La biblia terminaba en el código. Esto llega hasta producción.

## Regla cero

**Todo lo que entra al bundle es público por definición.** En environments van: URLs de API, flags, nombre de ambiente, claves PÚBLICAS (Sentry DSN, keys publishable). JAMÁS: secretos, API keys privadas, credenciales — esos viven en el backend, siempre.

## Environments tipados

- `core/config/`: interfaz `AppConfig` tipada + token de inyección. Los servicios inyectan el token — nunca importan `environment` directo por todo el código (cambiar la estrategia de config no puede significar tocar 50 archivos).
- `ng g environments` genera la base; `fileReplacements` por configuración en `angular.json` (default del builder).
- Ambientes: `development` / `staging` / `production` como configuraciones en `angular.json`. Staging = build de producción con config de staging — NUNCA un build "dev" en un servidor.
- Alternativa runtime-config (un `config.json` que se fetchea al bootstrap vía `provideAppInitializer`): usarla SOLO si el mismo artefacto de build debe correr en N ambientes (docker una-imagen-muchos-ambientes). Si no hay esa necesidad, `fileReplacements` y listo — no agregues el fetch inicial gratis.

## Build de producción

```bash
ng build --configuration=production
```

- **Budgets en `angular.json` que FALLAN el build**: initial ≤ ~450 KB comprimido como punto de partida — se ajusta con datos de RUM, no con fe.
- Salida en `dist/<app>/browser/`: se sirve estático con fallback de SPA (toda ruta desconocida → `index.html`) — sin ese fallback, el refresh en rutas profundas da 404.
- Source maps: se GENERAN y se suben al error tracking en el pipeline (Sentry u equivalente); no se sirven públicos en producción.
- Auditoría de bundle: `source-map-explorer` sobre el build — revela la verdad en 10 minutos.

## CI mínimo por PR (rojo = no merge, sin botón de "merge igual")

```
lint → typecheck → ng test --watch=false → ng build --configuration=production
```

El build de prod EN el CI no es opcional: compila estricto con budgets — un PR que pasa tests pero rompe el budget o el AOT no está listo.
