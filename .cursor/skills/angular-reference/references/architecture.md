# Referencia: Arquitectura Angular

> Filosofía: optimizar para el cambio, no para la foto actual. Decisiones CARAS de revertir (límites entre features, regla de dependencias, TS estricto, nombres) se toman bien el día 1. Las BARATAS (UI kit, librería de estado, monorepo tooling) se deciden tarde, con dolor real. YAGNI con dientes: una interfaz con una sola implementación es sospechosa.

## Stack base innegociable

- Angular última estable (cadencia 6 meses; >2 majors atrás = deuda con interés compuesto; actualizar cada major en sus primeros 3 meses vía `ng update`).
- TypeScript estricto: `strict: true`, `noUncheckedIndexedAccess: true`, `strictTemplates: true`. Sin excepciones.
- Signals + zoneless (Zone.js solo en legacy en migración). Standalone siempre; NgModules muertos.
- Builder `application` (esbuild/Vite). pnpm o npm con lockfile commiteado.
- Boundaries con Sheriff o eslint-plugin-boundaries **desde el día 1** — esto NO se pospone: es carísimo de retrofitear. Regla que no falla el CI = decoración.

## Estructura de carpetas (feature-first)

```
src/app/
├── core/                  # Singleton, se carga UNA vez, SIN UI, SIN lógica de negocio
│   ├── auth/              #   guards, interceptors, servicio de sesión
│   ├── http/              #   interceptor de errores, retry, base-url
│   └── config/            #   tokens de inyección, environments tipados
├── features/<feature>/
│   ├── data/              #   servicios HTTP, DTOs, mappers, modelos
│   ├── state/             #   signal store o servicio con signals
│   ├── ui/                #   componentes TONTOS de la feature
│   ├── feature/           #   componentes smart + <feature>.routes.ts
│   └── index.ts           #   API pública — lo ÚNICO importable desde fuera
├── shared/
│   ├── ui/                # tontos genéricos (botón, modal, tabla)
│   └── util/              # pipes, validators, helpers puros
└── app.routes.ts          # solo loadChildren hacia features
```

## Reglas de dependencia (impuestas por tooling, no por fe)

1. `features/A` NUNCA importa de `features/B`. Comunicación: router, estado compartido, o el común baja a `shared`.
2. `shared` no importa de `features` ni `core`. `core` no importa de `features`.
3. Todo import hacia una feature pasa por su `index.ts`. Import interno de otra feature = build roto.
4. Toda feature es lazy (`loadChildren`) desde el día 1.

## Anti-patrones de estructura (prohibidos)

- Carpetas por tipo técnico a nivel raíz (`/services`, `/components` gigantes).
- `SharedModule` que importa medio universo.
- `core` con lógica de negocio.

## Evolución por etapas — escalar es agregar tooling, nunca reorganizar

| Etapa | Señal | Se agrega |
|---|---|---|
| Base (1-3 devs) | inicio | Todo esto, sin Nx ni store global. Sheriff desde día 1. |
| Crecimiento | dolor REAL de estado compartido entre features | NgRx SignalStore solo en las features que lo justifiquen |
| Escala | múltiples equipos, builds lentos | Nx: cada feature se vuelve lib casi mecánicamente porque los boundaries se respetaron |

Lista negra transversal: `any` habitual · store global preventivo · big-bang rewrite (se migra por feature con strangler o no se migra) · reglas solo en documentos sin enforcement en CI · copiar patrones de tutoriales sin poder explicar el porqué acá.
