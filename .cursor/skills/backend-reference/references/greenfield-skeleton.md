# Esqueleto greenfield — estructura inicial para proyecto NUEVO

> Cargar SOLO cuando el proyecto arranca de cero (no hay código existente que seguir).
> Si hay código existente → NO cargar esto: se sigue el patrón del repo (constitución → "Código existente").
> En greenfield NO hay nada que investigar: la elección sale de la ENTREVISTA de abajo, no de explorar.

## 🔔 Entrevista de arranque (checkpoint — preguntar, no asumir)

Antes de crear una sola carpeta, el agente hace estas preguntas al dev y
recomienda con las tablas de abajo. El dev decide; el agente argumenta.

1. ¿Cuántas ENTIDADES de negocio con reglas propias esperás? (¿tienen
   invariantes reales o son CRUDs?)
2. ¿Cuántas integraciones externas? ¿Alguna intercambiable a futuro?
3. ¿Cuántos MÓDULOS de negocio distintos ves? ¿Un equipo o varios?
   ¿Algún módulo podría extraerse a otro servicio algún día?

Con 1 y 2 se elige el NIVEL. Con 3 se elige la ORGANIZACIÓN. Son dos ejes
independientes: nivel = cuánta ceremonia; organización = cómo se agrupa en disco.

## EJE 1 — Nivel de ceremonia (liviano vs completo)

**Ante la duda, LIVIANO.** Subir después es barato; desarmar capas vacías no.
Más capas NO es más profesional (constitución → anti-sobreingeniería).
El disparador es la COMPLEJIDAD DEL DOMINIO, nunca el tamaño en archivos.

| Señal | Liviano | Completo |
|---|---|---|
| Entidades de negocio | < ~8, reglas simples | Muchas, con invariantes reales |
| Integraciones externas | 0-2 | 3+ o intercambiables |
| Equipo / vida esperada | 1 persona, corta | Varios equipos, larga |
| ¿Testear negocio sin DB desde el día 1? | No urgente | Sí |

DDD táctico solo en Completo Y con dominio complejo (`references/ddd.md` — sigue
siendo opt-in).

### Nivel LIVIANO (default) — CRUD, servicios chicos, MVP

```
src/
├── api/      # entrada HTTP: rutas/controllers, validación de entrada
├── core/     # lógica de negocio: servicios + modelos (sin framework)
├── data/     # acceso a datos: repositorios concretos, clientes externos
└── shared/   # errores comunes, config tipada, helpers transversales
```

- ÚNICA regla innegociable: `api → core → data`; `core` no importa nada de
  `api` ni del framework web.
- SIN interfaces especulativas, SIN capa de use cases, SIN eventos de dominio.
  Controller que llama directo a un service está BIEN acá.

### Nivel COMPLETO — dominio complejo, varias integraciones

```
src/
├── domain/          # entidades, value objects, reglas puras. CERO deps externas.
├── application/     # use cases (orquestan), puertos (interfaces) hacia afuera
├── infrastructure/  # adaptadores: DB, APIs externas, colas — implementan puertos
└── presentation/    # entrada HTTP/CLI/workers, validación, mapeo req↔use case
```

- Todo apunta hacia `domain`; `domain` no conoce a nadie (constitución → SOLID
  y dependencias).
- Interfaces solo en fronteras reales con el mundo exterior (ISP —
  `references/solid-clean-arch.md`). Nunca "una interfaz por clase".
- Dónde vive cada patrón: tabla de `patterns-by-layer.mdc`.

## EJE 2 — Organización en disco: por CAPA o por FEATURE (screaming)

La regla de dependencia es LA MISMA en ambas; solo cambia cómo se agrupa.
No confundir con el Eje 1: hay liviano-por-capa, liviano-por-feature,
completo-por-capa y completo-por-feature.

**Por capa** (los árboles de arriba): todo lo del mismo anillo junto.

**Por feature** (screaming architecture — las carpetas gritan el negocio):
```
src/
├── users/
│   └── domain/  application/  infrastructure/  presentation/
├── orders/
│   └── domain/  application/  infrastructure/  presentation/
└── shared/      # solo lo genuinamente transversal; si crece mucho, mala señal
```

| Señal (pregunta 3 de la entrevista) | Por capa | Por feature |
|---|---|---|
| Módulos de negocio | < ~4 | 4+ |
| Equipos | Uno | Varios (cada uno dueño de su carpeta) |
| ¿Extraer un módulo a otro servicio a futuro? | No se ve | Posible |

- La regla de dependencia aplica IGUAL adentro de cada feature.
- Una feature NO importa los internos de otra: si necesita algo, va por
  `shared/` o por un contrato explícito. Cruce directo = acoplamiento oculto.

## Nomenclatura de archivos — patrón fijo, escritura según el lenguaje

**Patrón (agnóstico): nombre = [acción o entidad] + [rol].** Leyendo el nombre
se sabe qué hace y en qué anillo vive, sin abrir el archivo.

| Rol (anillo) | Sufijo canónico | Ejemplo Node/TS | Ejemplo C#/Java |
|---|---|---|---|
| Entidad (domain) | ninguno o `.entity` | `user.entity.ts` | `User.cs` |
| Value object (domain) | `.vo` / nombre solo | `email.vo.ts` | `Email.cs` |
| Puerto/contrato | `.repository` (interfaz) | `user.repository.ts` | `IUserRepository.cs` |
| Caso de uso | `.usecase` | `create-user.usecase.ts` | `CreateUserUseCase.cs` |
| Implementación de repo | `.repository` + tecnología | `user.postgres.repository.ts` | `PostgresUserRepository.cs` |
| Controller | `.controller` | `user.controller.ts` | `UserController.cs` |
| DTO | `.dto` | `create-user.dto.ts` | `CreateUserDto.cs` |

- La ESCRITURA (case) la dicta el ecosistema del lenguaje elegido: kebab-case
  en Node/TS, PascalCase en C#/Java, snake_case en Python. No inventar una propia.
- En nivel LIVIANO los sufijos se simplifican (`.service`, `.controller`,
  `.repository` alcanzan) — el patrón nombre=acción+rol se mantiene.
- Regla de oro: si dos archivos podrían confundirse por el nombre, uno de los
  dos está mal nombrado.

## Convenciones al crear el esqueleto (cualquier nivel)

- Carpetas en inglés, minúscula. Un archivo = una responsabilidad.
- Tests espejan `src/` (cuando el dev los pida — testing es opt-in).
- Documentar en el README en 5 líneas: nivel + organización elegidos, la regla
  de dependencia, y el porqué — para que el próximo que entre no adivine.
- Migrar de Liviano a Completo (o de capa a feature) después es una
  intervención con riesgo → pasa por `explore`/`propose` como cualquier
  refactor, no se hace "de paso".
